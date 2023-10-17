package entity

import (
	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
)

type Deployment struct {
	DeploymentId                 string  `json:"deploymentId"`
	DeploymentUserId             string  `json:"deploymentUserId"`
	DeploymentWorkspace          string  `json:"deploymentWorkspace"`
	DeploymentStatus             string  `json:"deploymentStatus"`
	DeploymentLab                LabType `json:"deploymentLab"`
	DeploymentAutoDelete         bool    `json:"deploymentAutoDelete"`
	DeploymentLifespan           int64   `json:"deploymentLifespan"`
	DeploymentAutoDeleteUnixTime int64   `json:"deploymentAutoDeleteUnixTime"`
}

type DeploymentEntry struct {
	aztables.Entity
	Deployment string
}

type DeploymentService interface {
	GetDeployments() ([]Deployment, error)
	GetMyDeployments(string) ([]Deployment, error)
	GetDeployment(string, string) (Deployment, error)
	AddDeployment(Deployment) error
	UpdateDeployment(Deployment) error
	DeleteDeployment(string, string) error
}

type DeploymentRepository interface {
	GetDeployments() ([]Deployment, error)
	GetMyDeployments(string) ([]Deployment, error)
	GetDeployment(string, string) (Deployment, error)
	AddDeployment(Deployment) error
	UpdateDeployment(Deployment) error
	DeleteDeployment(string, string) error
}
