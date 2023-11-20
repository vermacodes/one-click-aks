package service

import (
	"os"
	"strconv"
	"time"

	"github.com/vermacodes/one-click-aks/app/server/entity"
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

func NewDeploymentService(deploymentRepo entity.DeploymentRepository,
	labService entity.LabService,
	terraformService entity.TerraformService,
	actionStatusService entity.ActionStatusService,
	logstreamService entity.LogStreamService,
	authService entity.AuthService,
	workspaceService entity.WorkspaceService) entity.DeploymentService {
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
	deployments, err := d.deploymentRepository.GetMyDeployments(userId, activeAccount.Id)
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
			DeploymentId:                 userId + "-default-" + activeAccount.Id,
			DeploymentLab:                defaultLab,
			DeploymentAutoDelete:         false,
			DeploymentLifespan:           28800,
			DeploymentAutoDeleteUnixTime: 0,
		}

		if err := d.deploymentRepository.UpsertDeployment(deployment); err != nil {
			return nil, err
		}

		filteredDeployments = append(filteredDeployments, deployment)
	}

	return filteredDeployments, err
}

func (d *DeploymentService) GetDeployment(userId string, workspace string, subscriptionId string) (entity.Deployment, error) {
	return d.deploymentRepository.GetDeployment(userId, workspace, subscriptionId)
}

func (d *DeploymentService) GetSelectedDeployment() (entity.Deployment, error) {
	// get selected workspace
	selectedWorkspace, err := d.workspaceService.GetSelectedWorkspace()
	if err != nil {
		slog.Error("not able to get selected workspace", err)
		return entity.Deployment{}, err
	}

	//Get user principal from env variable.
	userPrincipal := os.Getenv("ARM_USER_PRINCIPAL_NAME")

	//Get all deployments.
	deployments, err := d.GetMyDeployments(userPrincipal)
	if err != nil {
		slog.Error("not able to get deployments", err)
		return entity.Deployment{}, nil
	}

	// Find the deployment for the selected workspace.
	for _, deployment := range deployments {
		if deployment.DeploymentWorkspace == selectedWorkspace.Name {
			return deployment, nil
		}
	}

	return entity.Deployment{}, nil
}

func (d *DeploymentService) SelectDeployment(deployment entity.Deployment) error {

	// check if workspace exists, if not add it.
	if err := checkAndAddWorkspace(d, &entity.Deployment{DeploymentWorkspace: deployment.DeploymentWorkspace}); err != nil {
		return err
	}

	// set workspace as selected.
	if err := d.workspaceService.Select(entity.Workspace{Name: deployment.DeploymentWorkspace, Selected: true}); err != nil {
		slog.Error("not able to select workspace", err)
		return err
	}

	return nil
}

func (d *DeploymentService) UpsertDeployment(deployment entity.Deployment) error {
	activeAccount, err := d.authService.GetActiveAccount()
	if err != nil {
		slog.Error("not able to get active account", err)
		return err
	}
	deployment.DeploymentSubscriptionId = activeAccount.Id

	// check if workspace exists, if not add it.
	if err := checkAndAddWorkspace(d, &deployment); err != nil {
		return err
	}

	// Add deployment operation entry.
	go d.deploymentRepository.DeploymentOperationEntry(deployment)

	return d.deploymentRepository.UpsertDeployment(deployment)

}

func (d *DeploymentService) DeleteDeployment(userId string, workspace string, subscriptionId string) error {

	// default deployment cant be deleted.
	if workspace == "default" {
		return nil
	}

	// select default workspace
	if err := d.workspaceService.Select(entity.Workspace{Name: "default", Selected: true}); err != nil {
		slog.Error("not able to select workspace", err)
		return err
	}

	// delete workspace
	if err := d.workspaceService.Delete(entity.Workspace{Name: workspace}); err != nil {
		slog.Error("not able to delete workspace", err)
		return err
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
				continue
			}

			// Wait for any action in progress to complete.

			for {
				if actionStatus.InProgress {
					slog.Info("action in progress. waiting for 60 seconds")
					time.Sleep(60 * time.Second)
					actionStatus, err = d.actionStatusService.GetActionStatus()
					if err != nil {
						slog.Error("not able to get action status", err)
						continue
					}
					continue
				}
				break
			}

			// Get the current workspace.
			prevSelectedDeployment, err := d.GetSelectedDeployment()
			if err != nil {
				slog.Error("not able to get current workspace", err)
				continue
			}

			// Change terraform workspace.
			if err := d.ChangeTerraformWorkspace(deployment); err != nil {
				slog.Error("not able to change terraform workspace", err)
				continue
			}

			// Update deployment status to deleting.
			deployment.DeploymentStatus = entity.DestroyInProgress
			if err := d.UpsertDeployment(deployment); err != nil {
				slog.Error("not able to update deployment", err)
				continue
			}

			// Update action status to in progress.
			d.actionStatusService.SetActionStart()

			//Run extend script in 'destroy' mode.
			if err := d.terraformService.Extend(deployment.DeploymentLab, "destroy"); err != nil {
				slog.Error("not able to run extend script", err)

				// Update deployment status to failed.
				deployment.DeploymentStatus = entity.DestroyFailed
				if err := d.UpsertDeployment(deployment); err != nil {
					slog.Error("not able to update deployment", err)
				}

				d.actionStatusService.SetActionEnd()
				continue
			}

			// Run terraform destroy.
			if err := d.terraformService.Destroy(deployment.DeploymentLab); err != nil {
				slog.Error("not able to run terraform destroy", err)

				// Update deployment status to failed.
				deployment.DeploymentStatus = entity.DestroyFailed
				if err := d.UpsertDeployment(deployment); err != nil {
					slog.Error("not able to update deployment", err)
				}

				d.actionStatusService.SetActionEnd()
				continue
			}

			// Update deployment status to destroyed.
			deployment.DeploymentStatus = entity.DestroyCompleted
			if err := d.UpsertDeployment(deployment); err != nil {
				slog.Error("not able to update deployment", err)
				d.actionStatusService.SetActionEnd()
				continue
			}

			// Change back to the original workspace.
			if err := d.ChangeTerraformWorkspace(prevSelectedDeployment); err != nil {
				slog.Error("not able to change back to original workspace", err)
				continue
			}

			d.actionStatusService.SetActionEnd()
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
		if deployment.DeploymentAutoDelete &&
			deployment.DeploymentAutoDeleteUnixTime < currentEpochTime &&
			deployment.DeploymentAutoDeleteUnixTime != 0 &&
			(deployment.DeploymentStatus == entity.DeploymentCompleted ||
				deployment.DeploymentStatus == entity.DeploymentFailed) {
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

func checkAndAddWorkspace(d *DeploymentService, deployment *entity.Deployment) error {
	// check if workspace exists, if not add it.
	workspaces, err := d.workspaceService.List()
	if err != nil {
		slog.Error("not able to get workspaces", err)
		return err
	}

	workspaceExists := false
	for _, workspace := range workspaces {
		if workspace.Name == deployment.DeploymentWorkspace {
			workspaceExists = true
			break
		}
	}

	if !workspaceExists {
		slog.Info("adding workspace " + deployment.DeploymentWorkspace)
		if err := d.workspaceService.Add(entity.Workspace{Name: deployment.DeploymentWorkspace}); err != nil {
			slog.Error("not able to add workspace", err)
			return err
		}
	}

	return nil
}
