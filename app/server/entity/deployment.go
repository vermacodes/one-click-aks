package entity

import (
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
)

type Deployment struct {
	Id                 string    `json:"id"`
	Name               string    `json:"name"`
	UserId             string    `json:"userId"`
	Workspace          string    `json:"workspace"`
	Lab                LabType   `json:"lab"`
	AutoDelete         bool      `json:"autoDelete"`
	AutoDeleteTime     time.Time `json:"autoDeleteTime"`
	AutoDeleteTimeUnix int64     `json:"autoDeleteTimeUnix"`
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
	DeleteDeployment(string, string) error
}

type DeploymentRepository interface {
	GetDeployments() ([]Deployment, error)
	GetMyDeployments(string) ([]Deployment, error)
	GetDeployment(string, string) (Deployment, error)
	AddDeployment(Deployment) error
	DeleteDeployment(string, string) error
}
