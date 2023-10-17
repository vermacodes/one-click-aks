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
	actionStatusService  entity.ActionStatusService
	logstreamService     entity.LogStreamService
}

func NewDeploymentService(deploymentRepo entity.DeploymentRepository, labService entity.LabService, terraformService entity.TerraformService, actionStatusService entity.ActionStatusService, logstreamService entity.LogStreamService) entity.DeploymentService {
	return &DeploymentService{
		deploymentRepository: deploymentRepo,
		labService:           labService,
		terraformService:     terraformService,
		actionStatusService:  actionStatusService,
		logstreamService:     logstreamService,
	}
}

func (d *DeploymentService) GetDeployments() ([]entity.Deployment, error) {
	return d.deploymentRepository.GetDeployments()
}

func (d *DeploymentService) GetMyDeployments(userId string) ([]entity.Deployment, error) {
	// add default deployment if no deployments found
	deployments, err := d.deploymentRepository.GetMyDeployments(userId)
	if err != nil {
		return nil, err
	}
	if len(deployments) == 0 {

		defaultLab, err := d.labService.HelperDefaultLab()
		if err != nil {
			return nil, err
		}

		deployment := entity.Deployment{
			DeploymentUserId:             userId,
			DeploymentWorkspace:          "default",
			DeploymentId:                 helper.Generate(5),
			DeploymentLab:                defaultLab,
			DeploymentAutoDelete:         false,
			DeploymentLifespan:           28800,
			DeploymentAutoDeleteUnixTime: 0,
		}

		if err := d.deploymentRepository.AddDeployment(deployment); err != nil {
			return nil, err
		}

		return d.deploymentRepository.GetMyDeployments(userId)

	}

	return deployments, err
}

func (d *DeploymentService) GetDeployment(userId string, workspace string) (entity.Deployment, error) {
	return d.deploymentRepository.GetDeployment(userId, workspace)
}

func (d *DeploymentService) AddDeployment(deployment entity.Deployment) error {
	return d.deploymentRepository.AddDeployment(deployment)
}

func (d *DeploymentService) UpdateDeployment(deployment entity.Deployment) error {
	return d.deploymentRepository.UpdateDeployment(deployment)
}

func (d *DeploymentService) DeleteDeployment(userId string, workspace string) error {

	// default deployment cant be deleted.
	if workspace == "default" {
		return nil
	}

	return d.deploymentRepository.DeleteDeployment(userId, workspace)
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

			if actionStatus.InProgress {
				slog.Info("action in progress. waiting.")
				time.Sleep(5 * time.Second)
				actionStatus, err = d.actionStatusService.GetActionStatus()
				if err != nil {
					slog.Error("not able to get action status", err)
					return err
				}
			}
			d.logstreamService.StartLogStream()

			// Update deployment status to deleting.
			deployment.DeploymentStatus = "Destroying Resources"
			if err := d.UpdateDeployment(deployment); err != nil {
				slog.Error("not able to update deployment", err)
				return err
			}

			//Run extend script in 'destroy' mode.
			if err := d.terraformService.Extend(deployment.DeploymentLab, "destroy"); err != nil {
				slog.Error("not able to run extend script", err)
				return err
			}

			// Run terraform destroy.
			terraformOperation, err := d.terraformService.DestroyAsync(deployment.DeploymentLab)
			if err != nil {
				slog.Error("not able to run terraform destroy", err)
				return err
			}

			// Wait for terraform destroy to complete.
			for {
				terraformOperation, err := d.actionStatusService.GetTerraformOperation(terraformOperation.OperationId)
				slog.Debug("terraformOperation.OperationStatus: " + terraformOperation.OperationStatus)
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
