package entity

type ActionStatus struct {
	InProgress bool `json:"inProgress"`
}

type TerraformOperation struct {
	OperationId string           `json:"operationId"`
	InProgress  bool             `json:"inProgress"`
	Status      DeploymentStatus `json:"status"`
}

type ServerNotificationType string

const (
	Info    ServerNotificationType = "info"
	Error   ServerNotificationType = "error"
	Success ServerNotificationType = "success"
	Default ServerNotificationType = "default"
	Warning ServerNotificationType = "warning"
)

type ServerNotification struct {
	Id               string                 `json:"id"`
	NotificationType ServerNotificationType `json:"type"`
	Message          string                 `json:"message"`
	AutoClose        int                    `json:"autoClose"` // 0 to never close
}

type ActionStatusService interface {
	GetActionStatus() (ActionStatus, error)
	SetActionStatus(ActionStatus) error
	SetActionStart() error
	SetActionEnd() error
	WaitForActionStatusChange() (ActionStatus, error)

	SetTerraformOperation(TerraformOperation) error
	GetTerraformOperation() (TerraformOperation, error)
	WaitForTerraformOperationChange() (TerraformOperation, error)

	SetServerNotification(ServerNotification) error
	GetServerNotification() (ServerNotification, error)
	WaitForServerNotificationChange() (ServerNotification, error)
}

type ActionStatusRepository interface {
	GetActionStatus() (string, error)
	SetActionStatus(string) error
	WaitForActionStatusChange() (string, error)

	SetTerraformOperation(string) error
	GetTerraformOperation() (string, error)
	WaitForTerraformOperationChange() (string, error)

	SetServerNotification(string) error
	GetServerNotification() (string, error)
	WaitForServerNotificationChange() (string, error)
}
