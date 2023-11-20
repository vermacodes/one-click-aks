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
		slog.Info("action status not found in redis")

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

func (a *actionStatusService) SetActionStart() error {
	actionStatus, err := a.GetActionStatus()
	if err != nil {
		slog.Error("not able to get current action status", err)
		return err
	}

	if !actionStatus.InProgress {
		actionStatus.InProgress = true
	}

	if err := a.SetActionStatus(actionStatus); err != nil {
		slog.Error("not able to set action status to start", err)
	}

	return nil
}

func (a *actionStatusService) SetActionEnd() error {
	actionStatus, err := a.GetActionStatus()
	if err != nil {
		slog.Error("not able to get current action status", err)
		return err
	}

	if actionStatus.InProgress {
		actionStatus.InProgress = false
	}

	if err := a.SetActionStatus(actionStatus); err != nil {
		slog.Error("not able to set action status to end", err)
	}

	return nil
}

func (a *actionStatusService) WaitForActionStatusChange() (entity.ActionStatus, error) {
	actionStatus := entity.ActionStatus{}
	val, err := a.actionStatusRepository.WaitForActionStatusChange()
	if err != nil {
		slog.Error("action status not found in redis", err)
		return actionStatus, err
	}

	if err = json.Unmarshal([]byte(val), &actionStatus); err != nil {
		slog.Error("not able to translate action status string to object", err)
		return actionStatus, err
	}

	return actionStatus, nil
}

func (a *actionStatusService) SetTerraformOperation(terraformOperation entity.TerraformOperation) error {
	val, err := json.Marshal(terraformOperation)
	if err != nil {
		slog.Error("not able to marshal object to string", err)
		return err
	}

	if err = a.actionStatusRepository.SetTerraformOperation(string(val)); err != nil {
		slog.Error("not able to set terraform operation in redis", err)
	}

	return nil
}

func (a *actionStatusService) GetTerraformOperation() (entity.TerraformOperation, error) {
	terraformOperation := entity.TerraformOperation{}
	val, err := a.actionStatusRepository.GetTerraformOperation()
	if err != nil {
		slog.Error("terraform operation not found in redis", err)
		return terraformOperation, err
	}

	if err = json.Unmarshal([]byte(val), &terraformOperation); err != nil {
		slog.Error("not able to translate terraform operation string to object", err)
		return terraformOperation, err
	}

	return terraformOperation, nil
}

func (a *actionStatusService) WaitForTerraformOperationChange() (entity.TerraformOperation, error) {
	terraformOperation := entity.TerraformOperation{}
	val, err := a.actionStatusRepository.WaitForTerraformOperationChange()
	if err != nil {
		slog.Error("action status not found in redis", err)
		return terraformOperation, err
	}

	if err = json.Unmarshal([]byte(val), &terraformOperation); err != nil {
		slog.Error("not able to translate action status string to object", err)
		return terraformOperation, err
	}

	return terraformOperation, nil
}

func (a *actionStatusService) SetServerNotification(serverNotification entity.ServerNotification) error {
	val, err := json.Marshal(serverNotification)
	if err != nil {
		slog.Error("not able to marshal object to string", err)
		return err
	}

	if err = a.actionStatusRepository.SetServerNotification(string(val)); err != nil {
		slog.Error("not able to set server notification in redis", err)
	}

	return nil
}

func (a *actionStatusService) GetServerNotification() (entity.ServerNotification, error) {
	serverNotification := entity.ServerNotification{}
	val, err := a.actionStatusRepository.GetServerNotification()
	if err != nil {
		slog.Error("server notification not found in redis", err)
		return serverNotification, err
	}

	if err = json.Unmarshal([]byte(val), &serverNotification); err != nil {
		slog.Error("not able to translate server notification string to object", err)
		return serverNotification, err
	}

	return serverNotification, nil
}

func (a *actionStatusService) WaitForServerNotificationChange() (entity.ServerNotification, error) {
	serverNotification := entity.ServerNotification{}
	val, err := a.actionStatusRepository.WaitForServerNotificationChange()
	if err != nil {
		slog.Error("server notification not found in redis", err)
		return serverNotification, err
	}

	if err = json.Unmarshal([]byte(val), &serverNotification); err != nil {
		slog.Error("not able to translate server notification string to object", err)
		return serverNotification, err
	}

	return serverNotification, nil
}
