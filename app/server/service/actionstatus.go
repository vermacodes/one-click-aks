package service

import (
	"encoding/json"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type actionStatusService struct {
	actionStatusRepository entity.ActionStatusRepository
}

func NewActionStatusService(actionStatusRepository entity.ActionStatusRepository) entity.ActionStatusService {
	return &actionStatusService{
		actionStatusRepository: actionStatusRepository,
	}
}

func (a *actionStatusService) GetActionStatus() (entity.ActionStatus, error) {
	actionStatus := entity.ActionStatus{}
	val, err := a.actionStatusRepository.GetActionStatus()
	if err != nil {
		slog.Error("action status not found in redis", err)

		// Reset to default.
		defaultActionStatus := entity.ActionStatus{
			InProgress: false,
		}

		if err := a.SetActionStatus(defaultActionStatus); err != nil {
			slog.Error("not able to set default action status in redis.", err)
		}

		return defaultActionStatus, nil
	}

	if err = json.Unmarshal([]byte(val), &actionStatus); err != nil {
		slog.Error("not able to translate action status string to object", err)
		return actionStatus, err
	}

	return actionStatus, nil
}

func (a *actionStatusService) SetActionStatus(actionStatus entity.ActionStatus) error {
	val, err := json.Marshal(actionStatus)
	if err != nil {
		slog.Error("not able to marshal object to string", err)
		return err
	}

	if err = a.actionStatusRepository.SetActionStatus(string(val)); err != nil {
		slog.Error("not able to set actions status in redis", err)
	}

	return nil
}
