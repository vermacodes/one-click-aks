package entity

type ActionStatus struct {
	InProgress bool `json:"inProgress"`
}

type TerraformOperation struct {
	OperationId string           `json:"operationId"`
	InProgress  bool             `json:"inProgress"`
	Status      DeploymentStatus `json:"status"`
}

type ActionStatusService interface {
	GetActionStatus() (ActionStatus, error)
	SetActionStatus(ActionStatus) error
	SetActionStart() error
	SetActionEnd() error
	WaitForActionStatusChange() (ActionStatus, error)

	SetTerraformOperation(TerraformOperation) error
	GetTerraformOperation(string) (TerraformOperation, error)
}

type ActionStatusRepository interface {
	GetActionStatus() (string, error)
	SetActionStatus(string) error
	WaitForActionStatusChange() (string, error)

	SetTerraformOperation(string, string) error
	GetTerraformOperation(string) (string, error)
}
