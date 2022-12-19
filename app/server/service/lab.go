package service

import (
	"bufio"
	"errors"
	"fmt"
	"io"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type labService struct {
	labRepository         entity.LabRepository
	logStreamService      entity.LogStreamService
	actionStatusService   entity.ActionStatusService
	storageAccountService entity.StorageAccountService // Some information is needed from storage aacount service.
}

func NewLabService(repo entity.LabRepository, logStreamService entity.LogStreamService, actionStatusService entity.ActionStatusService, storageAccountService entity.StorageAccountService) entity.LabService {
	return &labService{
		labRepository:         repo,
		logStreamService:      logStreamService,
		actionStatusService:   actionStatusService,
		storageAccountService: storageAccountService,
	}
}

func (l *labService) Plan(lab entity.LabType) error {
	return helperTerraformAction(l, lab.Template, "plan")
}

func (l *labService) Apply(lab entity.LabType) error {
	return helperTerraformAction(l, lab.Template, "apply")

	//TODO : Extenstion script
}

func (l *labService) Destroy(lab entity.LabType) error {
	return helperTerraformAction(l, lab.Template, "destroy")
}

func (l *labService) Validate() error {
	return nil
}

func helperTerraformAction(l *labService, tfvar entity.TfvarConfigType, action string) error {

	actionStaus, err := l.actionStatusService.GetActionStatus()
	if err != nil {
		slog.Error("not able to get current action status", err)
		return err
	}

	if actionStaus.InProgress {
		slog.Error("Error", errors.New("action already in progress"))
		return errors.New("action already in progress")
	}

	actionStaus.InProgress = true
	l.actionStatusService.SetActionStatus(actionStaus)

	storageAccountName, err := l.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return err
	}

	cmd, rPipe, wPipe, err := l.labRepository.TerraformAction(tfvar, action, storageAccountName)
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
			l.logStreamService.SetLogs(logStream)
		}
		input.Close()
	}(rPipe)

	cmd.Wait()
	wPipe.Close()
	l.logStreamService.EndLogStream()

	actionStaus.InProgress = false
	l.actionStatusService.SetActionStatus(actionStaus)

	return nil
}
