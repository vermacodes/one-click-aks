package service

import (
	"bufio"
	"errors"
	"fmt"
	"io"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type terraformService struct {
	terraformRepository   entity.TerraformRepository
	labService            entity.LabService
	workspaceService      entity.WorkspaceService
	logStreamService      entity.LogStreamService
	actionStatusService   entity.ActionStatusService
	kVersionService       entity.KVersionService
	storageAccountService entity.StorageAccountService // Some information is needed from storage aacount service.
}

func NewTerraformService(
	terraformRepository entity.TerraformRepository,
	labService entity.LabService,
	workspaceService entity.WorkspaceService,
	logStreamService entity.LogStreamService,
	actionStatusService entity.ActionStatusService,
	kVersionService entity.KVersionService,
	storageAccountService entity.StorageAccountService,
) entity.TerraformService {
	return &terraformService{
		terraformRepository:   terraformRepository,
		labService:            labService,
		logStreamService:      logStreamService,
		actionStatusService:   actionStatusService,
		kVersionService:       kVersionService,
		workspaceService:      workspaceService,
		storageAccountService: storageAccountService,
	}
}

func (t *terraformService) Init() error {
	lab, err := t.labService.GetLabFromRedis()
	if err != nil {
		slog.Error("not able to get lab from redis", err)
	}

	// Invalidate workspace cache
	if err := t.workspaceService.DeleteAllWorkspaceFromRedis(); err != nil {
		slog.Error("not able to invlidate workspace cache", err)
		return err
	}

	return helperTerraformAction(t, lab.Template, "init")
}

func (t *terraformService) Plan(lab entity.LabType) error {
	return helperTerraformAction(t, lab.Template, "plan")
}

func (t *terraformService) Apply(lab entity.LabType) error {
	// Invalidate workspace cache
	if err := t.workspaceService.DeleteAllWorkspaceFromRedis(); err != nil {
		slog.Error("not able to invlidate workspace cache", err)
		return err
	}

	return helperTerraformAction(t, lab.Template, "apply")

	//TODO : Extenstion script
}

func (t *terraformService) Destroy(lab entity.LabType) error {
	// Invalidate workspace cache
	if err := t.workspaceService.DeleteAllWorkspaceFromRedis(); err != nil {
		slog.Error("not able to invlidate workspace cache", err)
		return err
	}

	return helperTerraformAction(t, lab.Template, "destroy")
}

func (t *terraformService) Validate() error {
	return nil
}

func helperTerraformAction(t *terraformService, tfvar entity.TfvarConfigType, action string) error {

	actionStaus, err := t.actionStatusService.GetActionStatus()
	if err != nil {
		slog.Error("not able to get current action status", err)

		// Defaulting to no action
		actionStaus := entity.ActionStatus{
			InProgress: false,
		}
		if err := t.actionStatusService.SetActionStatus(actionStaus); err != nil {
			slog.Error("not able to set default action status.", err)
		}
	}

	if actionStaus.InProgress {
		slog.Error("Error", errors.New("action already in progress"))
		return errors.New("action already in progress")
	}

	actionStaus.InProgress = true
	t.actionStatusService.SetActionStatus(actionStaus)

	storageAccountName, err := t.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return err
	}

	cmd, rPipe, wPipe, err := t.terraformRepository.TerraformAction(tfvar, action, storageAccountName)
	if err != nil {
		slog.Error("not able to run terraform script", err)
	}

	// GO routine that takes care of running command and moving logs to redis.
	go func(input io.ReadCloser) {
		in := bufio.NewScanner(input)
		logStream := entity.LogStream{
			Logs:        "",
			IsStreaming: true,
		}
		for in.Scan() {
			logStream.Logs = logStream.Logs + fmt.Sprintf("%s\n", in.Text()) // Appening 'end' to signal stream end.
			t.logStreamService.SetLogs(logStream)
		}
		input.Close()
	}(rPipe)

	cmd.Wait()
	wPipe.Close()
	t.logStreamService.EndLogStream()

	actionStaus.InProgress = false
	t.actionStatusService.SetActionStatus(actionStaus)

	return nil
}
