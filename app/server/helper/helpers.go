package helper

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
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

// CalculateNewEpochTimeForDeployment updates the deployment's destroy time in place.
func CalculateNewEpochTimeForDeployment(deployment *entity.Deployment) {
	if !deployment.DeploymentAutoDelete {
		deployment.DeploymentAutoDeleteUnixTime = 0
	} else {
		now := time.Now()
		// Get epoch time in seconds
		epochTime := now.Unix()
		deployment.DeploymentAutoDeleteUnixTime = deployment.DeploymentLifespan + epochTime
	}
}
