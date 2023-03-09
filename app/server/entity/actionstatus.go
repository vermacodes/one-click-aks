package entity

type ActionStatus struct {
	InProgress bool `json:"inProgress"`
}

type TerraformOperation struct {
	OperationId     string `json:"operationId"`
	OperationType   string `json:"operationType"`
	OperationStatus string `json:"operationStatus"`
	LabId           string `json:"labId"`
	LabName         string `json:"labName"`
	LabType         string `json:"labType"`
}

type ActionStatusService interface {
	GetActionStatus() (ActionStatus, error)
	SetActionStatus(ActionStatus) error
	SetActionStart() error
	SetActionEnd() error

	SetTerraformOperation(TerraformOperation) error
	GetTerraformOperation(string) (TerraformOperation, error)
}

type ActionStatusRepository interface {
	GetActionStatus() (string, error)
	SetActionStatus(string) error

	SetTerraformOperation(string, string) error
	GetTerraformOperation(string) (string, error)
}
