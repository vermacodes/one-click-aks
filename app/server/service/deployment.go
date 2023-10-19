package service

import (
	"os"
	"strconv"
	"time"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
	"golang.org/x/exp/slog"
)

type DeploymentService struct {
	deploymentRepository entity.DeploymentRepository
	labService           entity.LabService
	terraformService     entity.TerraformService
	workspaceService     entity.WorkspaceService
	actionStatusService  entity.ActionStatusService
	logstreamService     entity.LogStreamService
	authService          entity.AuthService
}

func NewDeploymentService(deploymentRepo entity.DeploymentRepository, labService entity.LabService, terraformService entity.TerraformService, actionStatusService entity.ActionStatusService, logstreamService entity.LogStreamService, authService entity.AuthService, workspaceService entity.WorkspaceService) entity.DeploymentService {
	return &DeploymentService{
		deploymentRepository: deploymentRepo,
		labService:           labService,
		terraformService:     terraformService,
		actionStatusService:  actionStatusService,
		logstreamService:     logstreamService,
		authService:          authService,
		workspaceService:     workspaceService,
	}
}

func (d *DeploymentService) GetDeployments() ([]entity.Deployment, error) {
	return d.deploymentRepository.GetDeployments()
}

func (d *DeploymentService) GetMyDeployments(userId string) ([]entity.Deployment, error) {

	activeAccount, err := d.authService.GetActiveAccount()
	if err != nil {
		slog.Error("not able to get active account", err)
		return nil, err
	}

	// get all deployments
	deployments, err := d.deploymentRepository.GetMyDeployments(userId)
	if err != nil {
		return nil, err
	}

	// filter deployments for active account
	var filteredDeployments []entity.Deployment
	for _, deployment := range deployments {
		slog.Debug("Deployment Filter", "workspace", deployment.DeploymentWorkspace, "subscription", deployment.DeploymentSubscriptionId, "active", activeAccount.Id)
		if deployment.DeploymentSubscriptionId == activeAccount.Id {
			filteredDeployments = append(filteredDeployments, deployment)
		}
	}

	// if no deployments found for active account, create default deployment.
	if len(filteredDeployments) == 0 {

		defaultLab, err := d.labService.HelperDefaultLab()
		if err != nil {
			return nil, err
		}

		deployment := entity.Deployment{
			DeploymentUserId:             userId,
			DeploymentWorkspace:          "default",
			DeploymentSubscriptionId:     activeAccount.Id,
			DeploymentId:                 helper.Generate(5),
			DeploymentLab:                defaultLab,
			DeploymentAutoDelete:         false,
			DeploymentLifespan:           28800,
			DeploymentAutoDeleteUnixTime: 0,
		}

		if err := d.deploymentRepository.AddDeployment(deployment); err != nil {
			return nil, err
		}

		filteredDeployments = append(filteredDeployments, deployment)
	}

	return filteredDeployments, err
}

func (d *DeploymentService) GetDeployment(userId string, workspace string, subscriptionId string) (entity.Deployment, error) {
	return d.deploymentRepository.GetDeployment(userId, workspace, subscriptionId)
}

func (d *DeploymentService) AddDeployment(deployment entity.Deployment) error {
	activeAccount, err := d.authService.GetActiveAccount()
	if err != nil {
		slog.Error("not able to get active account", err)
		return err
	}
	deployment.DeploymentSubscriptionId = activeAccount.Id

	return d.deploymentRepository.AddDeployment(deployment)
}

func (d *DeploymentService) UpdateDeployment(deployment entity.Deployment) error {
	activeAccount, err := d.authService.GetActiveAccount()
	if err != nil {
		slog.Error("not able to get active account", err)
		return err
	}
	deployment.DeploymentSubscriptionId = activeAccount.Id

	return d.deploymentRepository.UpdateDeployment(deployment)
}

func (d *DeploymentService) DeleteDeployment(userId string, workspace string, subscriptionId string) error {

	// default deployment cant be deleted.
	if workspace == "default" {
		return nil
	}

	return d.deploymentRepository.DeleteDeployment(userId, workspace, subscriptionId)
}

func (d *DeploymentService) PollAndDeleteDeployments(interval time.Duration) error {
	dataChannel := make(chan []entity.Deployment)
	go func() {
		for {
			deployments := d.FetchDeploymentsToBeDeleted()
			dataChannel <- deployments
			slog.Debug("polling for deployments to be deleted found " + strconv.Itoa(len(deployments)) + " deployments")
			time.Sleep(interval)
		}
	}()

	for {
		deployments := <-dataChannel
		for _, deployment := range deployments {
			slog.Info("deleting deployment " + deployment.DeploymentWorkspace)

			actionStatus, err := d.actionStatusService.GetActionStatus()
			if err != nil {
				slog.Error("not able to get action status", err)
				return err
			}

			// Wait for any action in progress to complete.

			for {
				if actionStatus.InProgress {
					slog.Info("action in progress. waiting for 60 seconds")
					time.Sleep(60 * time.Second)
					actionStatus, err = d.actionStatusService.GetActionStatus()
					if err != nil {
						slog.Error("not able to get action status", err)
						return err
					}
					continue
				}
				break
			}

			d.logstreamService.StartLogStream()

			// Change terraform workspace.
			if err := d.ChangeTerraformWorkspace(deployment); err != nil {
				slog.Error("not able to change terraform workspace", err)
				return err
			}

			// Update deployment status to deleting.
			deployment.DeploymentStatus = "Destroying Resources"
			if err := d.UpdateDeployment(deployment); err != nil {
				slog.Error("not able to update deployment", err)
				return err
			}

			//Run extend script in 'destroy' mode.
			if err := d.terraformService.Extend(deployment.DeploymentLab, "destroy"); err != nil {
				slog.Error("not able to run extend script", err)

				// Update deployment status to failed.
				deployment.DeploymentStatus = "Deployment Failed"
				if err := d.UpdateDeployment(deployment); err != nil {
					slog.Error("not able to update deployment", err)
				}

				return err
			}

			// Run terraform destroy.
			terraformOperation, err := d.terraformService.DestroyAsync(deployment.DeploymentLab)
			if err != nil {
				slog.Error("not able to run terraform destroy", err)

				// Update deployment status to failed.
				deployment.DeploymentStatus = "Deployment Failed"
				if err := d.UpdateDeployment(deployment); err != nil {
					slog.Error("not able to update deployment", err)
				}

				return err
			}

			// Wait for terraform destroy to complete.
			for {
				terraformOperation, err := d.actionStatusService.GetTerraformOperation(terraformOperation.OperationId)
				slog.Debug("terraformOperation.OperationStatus: " + terraformOperation.OperationStatus)
				if err != nil {
					slog.Error("not able to get terraform operation", err)
					// Update deployment status to failed.
					deployment.DeploymentStatus = "Deployment Failed"
					if err := d.UpdateDeployment(deployment); err != nil {
						slog.Error("not able to update deployment", err)
					}

					break
				}

				if terraformOperation.OperationStatus != "inprogress" {
					break
				}
				time.Sleep(5 * time.Second)
			}

			// Update deployment status to deleting.
			deployment.DeploymentStatus = "Resources Destroyed"
			if err := d.UpdateDeployment(deployment); err != nil {
				slog.Error("not able to update deployment", err)
				return err
			}

			//Delete deployment record.
			// if err := deploymentService.DeleteDeployment(deployment.DeploymentUserId, deployment.DeploymentWorkspace); err != nil {
			// 	slog.Error("not able to delete deployment", err)
			// }

			d.logstreamService.EndLogStream()
		}
	}
}

func (d *DeploymentService) FetchDeploymentsToBeDeleted() []entity.Deployment {
	//Get user principal from env variable.
	userPrincipal := os.Getenv("ARM_USER_PRINCIPAL_NAME")

	//Get all deployments.
	deployments, err := d.GetMyDeployments(userPrincipal)
	if err != nil {
		slog.Error("not able to get deployments", err)
		return nil
	}

	// Filter deployments where auto delete is true and auto delete unix time is less than current unix time.
	var deploymentsToBeDeleted []entity.Deployment

	for _, deployment := range deployments {
		currentEpochTime := time.Now().Unix()
		slog.Debug("currentEpochTime: " + strconv.FormatInt(currentEpochTime, 10))
		if deployment.DeploymentAutoDelete && deployment.DeploymentAutoDeleteUnixTime < currentEpochTime && deployment.DeploymentAutoDeleteUnixTime != 0 && deployment.DeploymentStatus != "Destroying Resources" && deployment.DeploymentStatus != "Resources Destroyed" {
			deploymentsToBeDeleted = append(deploymentsToBeDeleted, deployment)
		}
	}

	return deploymentsToBeDeleted
}

func (d *DeploymentService) ChangeTerraformWorkspace(deployment entity.Deployment) error {
	// change terraform workspace if not same as deployments
	workspaces, err := d.workspaceService.List()
	if err != nil {
		slog.Error("not able to get workspaces", err)
		return err
	}
	selectedWorkspace := entity.Workspace{}
	for _, workspace := range workspaces {
		if workspace.Selected {
			selectedWorkspace = workspace
		}
	}
	if selectedWorkspace.Name != deployment.DeploymentWorkspace {
		slog.Info("changing workspace to " + deployment.DeploymentWorkspace)
		if err := d.workspaceService.Select(entity.Workspace{Name: deployment.DeploymentWorkspace}); err != nil {
			slog.Error("not able to select workspace", err)
			return err
		}
	}
	return nil
}
