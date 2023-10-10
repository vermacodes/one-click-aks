package service

import "github.com/vermacodes/one-click-aks/app/server/entity"

type DeploymentService struct {
	deploymentRepository entity.DeploymentRepository
}

func NewDeploymentService(deploymentRepo entity.DeploymentRepository) entity.DeploymentService {
	return &DeploymentService{
		deploymentRepository: deploymentRepo,
	}
}

func (d *DeploymentService) GetDeployments() ([]entity.Deployment, error) {
	return d.deploymentRepository.GetDeployments()
}

func (d *DeploymentService) GetMyDeployments(userId string) ([]entity.Deployment, error) {
	return d.deploymentRepository.GetMyDeployments(userId)
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
	return d.deploymentRepository.DeleteDeployment(userId, workspace)
}
