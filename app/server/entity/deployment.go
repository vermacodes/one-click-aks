package entity

import (
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
)

type DeploymentStatus string

const (
	InitInProgress       DeploymentStatus = "Init In Progress"
	InitFailed           DeploymentStatus = "Init Failed"
	InitCompleted        DeploymentStatus = "Init Completed"
	PlanInProgress       DeploymentStatus = "Plan In Progress"
	PlanFailed           DeploymentStatus = "Plan Failed"
	PlanCompleted        DeploymentStatus = "Plan Completed"
	DeploymentInProgress DeploymentStatus = "Deployment In Progress"
	DeploymentFailed     DeploymentStatus = "Deployment Failed"
	DeploymentCompleted  DeploymentStatus = "Deployment Completed"
	DeploymentNotStarted DeploymentStatus = "Deployment Not Started"
	DestroyInProgress    DeploymentStatus = "Destroy In Progress"
	DestroyCompleted     DeploymentStatus = "Destroy Completed"
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

type OperationEntry struct {
	PartitionKey                 string           `json:"PartitionKey"`
	RowKey                       string           `json:"RowKey"`
	DeploymentWorkspace          string           `json:"DeploymentWorkspace"`
	DeploymentUserId             string           `json:"DeploymentUserId"`
	DeploymentSubscriptionId     string           `json:"DeploymentSubscriptionId"`
	DeploymentStatus             DeploymentStatus `json:"DeploymentStatus"`
	DeploymentAutoDelete         bool             `json:"DeploymentAutoDelete"`
	DeploymentLifespan           int64            `json:"DeploymentLifespan"`
	DeploymentAutoDeleteUnixTime int64            `json:"DeploymentAutoDeleteUnixTime"`
	DeploymentLab                string           `json:"DeploymentLab"`
}

type DeploymentService interface {
	GetDeployments() ([]Deployment, error)
	GetMyDeployments(string) ([]Deployment, error)
	GetDeployment(string, string, string) (Deployment, error)
	GetSelectedDeployment() (Deployment, error)
	SelectDeployment(Deployment) error
	UpsertDeployment(Deployment) error
	DeleteDeployment(string, string, string) error
	PollAndDeleteDeployments(time.Duration) error
	FetchDeploymentsToBeDeleted() []Deployment
	ChangeTerraformWorkspace(Deployment) error
}

type DeploymentRepository interface {
	GetDeployments() ([]Deployment, error)
	GetMyDeployments(string, string) ([]Deployment, error)
	GetDeployment(string, string, string) (Deployment, error)
	UpsertDeployment(Deployment) error
	DeploymentOperationEntry(Deployment) error
	DeleteDeployment(string, string, string) error
}
