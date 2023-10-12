package service

import (
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
)

type DeploymentService struct {
	deploymentRepository entity.DeploymentRepository
	labService           entity.LabService
}

func NewDeploymentService(deploymentRepo entity.DeploymentRepository, labService entity.LabService) entity.DeploymentService {
	return &DeploymentService{
		deploymentRepository: deploymentRepo,
		labService:           labService,
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
