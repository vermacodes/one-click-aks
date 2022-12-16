package entity

type ActionStatus struct {
	InProgress bool `json:"inProgress"`
}

type ActionStatusService interface {
	GetActionStatus() (ActionStatus, error)
	SetActionStatus(ActionStatus) error
}

type ActionStatusRepository interface {
	GetActionStatus() (string, error)
	SetActionStatus(string) error
}
