package entity

import (
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
)

type DeploymentStatus string

const (
	DeploymentInProgress DeploymentStatus = "Deployment In Progress"
	DeploymentFailed     DeploymentStatus = "Deployment Failed"
	DeploymentCompleted  DeploymentStatus = "Deployment Completed"
	DeploymentNotStarted DeploymentStatus = "Deployment Not Started"
	DestroyingResources  DeploymentStatus = "Destroying Resources"
	ResourcesDestroyed   DeploymentStatus = "Resources Destroyed"
	DestroyFailed        DeploymentStatus = "Destroy Failed"
)

type Deployment struct {
	//aztables.Entity              `json:"-"`
	DeploymentId                 string           `json:"deploymentId"`
	DeploymentUserId             string           `json:"deploymentUserId"`
	DeploymentSubscriptionId     string           `json:"deploymentSubscriptionId"`
	DeploymentWorkspace          string           `json:"deploymentWorkspace"`
	DeploymentStatus             DeploymentStatus `json:"deploymentStatus"`
	DeploymentLab                LabType          `json:"deploymentLab"`
	DeploymentAutoDelete         bool             `json:"deploymentAutoDelete"`
	DeploymentLifespan           int64            `json:"deploymentLifespan"`
	DeploymentAutoDeleteUnixTime int64            `json:"deploymentAutoDeleteUnixTime"`
}

type DeploymentEntry struct {
	aztables.Entity
	Deployment string
}

type DeploymentService interface {
	GetDeployments() ([]Deployment, error)
	GetMyDeployments(string) ([]Deployment, error)
	GetDeployment(string, string, string) (Deployment, error)
	SelectDeployment(Deployment) error
	UpsertDeployment(Deployment) error
	DeleteDeployment(string, string, string) error
	PollAndDeleteDeployments(time.Duration) error
	FetchDeploymentsToBeDeleted() []Deployment
	ChangeTerraformWorkspace(Deployment) error
}

type DeploymentRepository interface {
	GetDeployments() ([]Deployment, error)
	GetMyDeployments(string) ([]Deployment, error)
	GetDeployment(string, string, string) (Deployment, error)
	UpsertDeployment(Deployment) error
	DeleteDeployment(string, string, string) error
}
