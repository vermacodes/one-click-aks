package helper

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"os"
	"strconv"
	"strings"
	"time"
	"unicode"
	"unsafe"

	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

var alphabet = []byte("abcdefghijklmnopqrstuvwxyz0123456789")

func Generate(size int) string {
	b := make([]byte, size)
	rand.Read(b)
	for i := 0; i < size; i++ {
		b[i] = alphabet[b[i]%byte(len(alphabet))]
	}
	return *(*string)(unsafe.Pointer(&b))
}

func CamelToConventional(s string) string {
	var result []rune
	var runes = []rune(s)
	for i := 0; i < len(runes); i++ {
		if i > 0 && unicode.IsUpper(runes[i]) && ((i+1 < len(runes) && unicode.IsLower(runes[i+1])) || unicode.IsLower(runes[i-1])) {
			result = append(result, '_')
		}
		result = append(result, unicode.ToLower(runes[i]))
	}
	return string(result)
}

func GetUserPrincipalFromMSALAuthToken(token string) (string, error) {

	// Split the token into its parts
	tokenParts := strings.Split(token, ".")
	if len(tokenParts) < 2 {
		err := errors.New("invalid token format")
		slog.Error("invalid token format", err)
		return "", err
	}

	// Decode the token
	decodedToken, err := base64.StdEncoding.DecodeString(tokenParts[1] + strings.Repeat("=", (4-len(tokenParts[1])%4)%4))
	if err != nil {
		slog.Error("not able to decode token -> ", err)
		return "", err
	}

	// Extract the user principal name from the decoded token
	var tokenJSON map[string]interface{}
	err = json.Unmarshal(decodedToken, &tokenJSON)
	if err != nil {
		slog.Error("not able to unmarshal token -> ", err)
		return "", err
	}

	userPrincipal, ok := tokenJSON["upn"].(string)
	if !ok {
		err := errors.New("user principal name not found in token")
		slog.Error("user principal name not found in token", err)
		return "", err
	}

	return userPrincipal, nil
}

func GetServiceClient() *aztables.ServiceClient {

	SasUrl := "https://" + entity.StorageAccountName + ".table.core.windows.net/" + entity.SasToken
	serviceClient, err := aztables.NewServiceClientWithNoCredential(SasUrl, nil)
	if err != nil {
		slog.Error("error get client", err)
	}

	return serviceClient
}

func PollAndDeleteDeployments(interval time.Duration, deploymentService entity.DeploymentService, terraformService entity.TerraformService, actionStatusService entity.ActionStatusService, logstreamService entity.LogStreamService) {
	dataChannel := make(chan []entity.Deployment)
	go func() {
		for {
			deployments := FetchDeploymentsToBeDeleted(deploymentService)
			dataChannel <- deployments
			slog.Info("polling for deployments to be deleted found " + strconv.Itoa(len(deployments)) + " deployments")
			time.Sleep(interval)
		}
	}()

	for {
		deployments := <-dataChannel
		for _, deployment := range deployments {
			slog.Info("deleting deployment " + deployment.DeploymentWorkspace)

			actionStatus, err := actionStatusService.GetActionStatus()
			if err != nil {
				slog.Error("not able to get action status", err)
				return
			}

			if actionStatus.InProgress {
				slog.Info("action in progress. waiting.")
				time.Sleep(5 * time.Second)
				actionStatus, err = actionStatusService.GetActionStatus()
				if err != nil {
					slog.Error("not able to get action status", err)
					return
				}
			}
			logstreamService.StartLogStream()

			// Update deployment status to deleting.
			deployment.DeploymentStatus = "Destroying Resources"
			if err := deploymentService.UpdateDeployment(deployment); err != nil {
				slog.Error("not able to update deployment", err)
				return
			}

			//Run extend script in 'destroy' mode.
			if err := terraformService.Extend(deployment.DeploymentLab, "destroy"); err != nil {
				slog.Error("not able to run extend script", err)
				return
			}

			// Run terraform destroy.
			terraformOperation, err := terraformService.DestroyAsync(deployment.DeploymentLab)
			if err != nil {
				slog.Error("not able to run terraform destroy", err)
				return
			}

			// Wait for terraform destroy to complete.
			for {
				terraformOperation, err := actionStatusService.GetTerraformOperation(terraformOperation.OperationId)
				slog.Info("terraformOperation.OperationStatus: " + terraformOperation.OperationStatus)
				if err != nil {
					slog.Error("not able to get terraform operation", err)
					break
				}

				if terraformOperation.OperationStatus != "inprogress" {
					break
				}
				time.Sleep(5 * time.Second)
			}

			// Update deployment status to deleting.
			deployment.DeploymentStatus = "Resources Destroyed"
			if err := deploymentService.UpdateDeployment(deployment); err != nil {
				slog.Error("not able to update deployment", err)
				return
			}

			//Delete deployment record.
			// if err := deploymentService.DeleteDeployment(deployment.DeploymentUserId, deployment.DeploymentWorkspace); err != nil {
			// 	slog.Error("not able to delete deployment", err)
			// }

			logstreamService.EndLogStream()
		}
	}
}

func FetchDeploymentsToBeDeleted(deploymentService entity.DeploymentService) []entity.Deployment {
	//Get user principal from env variable.
	userPrincipal := os.Getenv("ARM_USER_PRINCIPAL_NAME")

	//Get all deployments.
	deployments, err := deploymentService.GetMyDeployments(userPrincipal)
	if err != nil {
		slog.Error("not able to get deployments", err)
		return nil
	}

	// Filter deployments where auto delete is true and auto delete unix time is less than current unix time.
	var deploymentsToBeDeleted []entity.Deployment

	for _, deployment := range deployments {
		currentEpochTime := time.Now().Unix()
		slog.Info("currentEpochTime: " + strconv.FormatInt(currentEpochTime, 10))
		if deployment.DeploymentAutoDelete && deployment.DeploymentAutoDeleteUnixTime < currentEpochTime && deployment.DeploymentAutoDeleteUnixTime != 0 && deployment.DeploymentStatus != "Destroying Resources" && deployment.DeploymentStatus != "Resources Destroyed" {
			deploymentsToBeDeleted = append(deploymentsToBeDeleted, deployment)
		}
	}

	return deploymentsToBeDeleted
}
