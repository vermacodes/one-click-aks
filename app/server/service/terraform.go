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
	storageAccountService entity.StorageAccountService // Some information is needed from storage account service.
	loggingService        entity.LoggingService
	authService           entity.AuthService
}

func NewTerraformService(
	terraformRepository entity.TerraformRepository,
	labService entity.LabService,
	workspaceService entity.WorkspaceService,
	logStreamService entity.LogStreamService,
	actionStatusService entity.ActionStatusService,
	kVersionService entity.KVersionService,
	storageAccountService entity.StorageAccountService,
	loggingService entity.LoggingService,
	authService entity.AuthService,
) entity.TerraformService {
	return &terraformService{
		terraformRepository:   terraformRepository,
		labService:            labService,
		logStreamService:      logStreamService,
		actionStatusService:   actionStatusService,
		kVersionService:       kVersionService,
		workspaceService:      workspaceService,
		storageAccountService: storageAccountService,
		loggingService:        loggingService,
		authService:           authService,
	}
}

func (t *terraformService) Init() error {
	lab, err := t.labService.GetLabFromRedis()
	if err != nil {
		slog.Error("not able to get lab from redis", err)
	}

	// Invalidate workspace cache
	if err := t.workspaceService.DeleteAllWorkspaceFromRedis(); err != nil {
		slog.Error("not able to invalidate workspace cache", err)
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
		slog.Error("not able to invalidate workspace cache", err)
		return err
	}

	if err := helperTerraformAction(t, lab.Template, "apply"); err != nil {
		slog.Error("terraform apply failed", err)
		return err
	}

	return t.Extend(lab, "apply")

}

func (t *terraformService) Extend(lab entity.LabType, mode string) error {

	// Getting back redacted values
	if lab.ExtendScript == "redacted" {
		lab, err := helperGetCompleteLabById(t, lab.Type, lab.Id)
		if err != nil {
			slog.Error("not able to find the complete lab", err)
			return err
		}
		return helperExecuteScript(t, lab.ExtendScript, mode)
	}
	return helperExecuteScript(t, lab.ExtendScript, mode)
}

func (t *terraformService) Destroy(lab entity.LabType) error {
	// Invalidate workspace cache
	if err := t.workspaceService.DeleteAllWorkspaceFromRedis(); err != nil {
		slog.Error("not able to invalidate workspace cache", err)
		return err
	}

	if err := t.Extend(lab, "destroy"); err != nil {
		slog.Error("error running extend script in destroy mode", err)
		return err
	}

	if err := helperTerraformAction(t, lab.Template, "destroy"); err != nil {
		slog.Error("terraform destroy failed", err)
		return err
	}

	return nil
}

func helperTerraformAction(t *terraformService, tfvar entity.TfvarConfigType, action string) error {

	storageAccountName, err := t.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return err
	}

	for i, cluster := range tfvar.KubernetesClusters {
		if !t.kVersionService.DoesVersionExist(cluster.KubernetesVersion) {
			slog.Debug("Kubernetes version not found. Defaulting to default version.")
			tfvar.KubernetesClusters[i].KubernetesVersion = t.kVersionService.GetDefaultVersion()
		}
	}

	cmd, rPipe, wPipe, err := t.terraformRepository.TerraformAction(tfvar, action, storageAccountName)
	if err != nil {
		slog.Error("not able to run terraform script", err)
	}

	// Getting current logs.
	if _, err := t.logStreamService.GetLogs(); err != nil {
		slog.Error("not able to get current logs", err)
		return err
	}

	// GO routine that takes care of running command and moving logs to redis.
	go func(input io.ReadCloser) {
		in := bufio.NewScanner(input)

		for in.Scan() {
			// Appending logs to redis.
			t.logStreamService.AppendLogs(fmt.Sprintf("%s\n", in.Text()))
		}
		input.Close()
	}(rPipe)

	err = cmd.Wait()
	wPipe.Close()

	return err
}

func helperExecuteScript(t *terraformService, script string, mode string) error {

	storageAccountName, err := t.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return err
	}

	cmd, rPipe, wPipe, err := t.terraformRepository.ExecuteScript(script, mode, storageAccountName)
	if err != nil {
		slog.Error("not able to run terraform script", err)
	}

	// GO routine that takes care of running command and moving logs to redis.
	go func(input io.ReadCloser) {
		in := bufio.NewScanner(input)

		for in.Scan() {
			t.logStreamService.AppendLogs(fmt.Sprintf("%s\n", in.Text()))
		}
		input.Close()
	}(rPipe)

	err = cmd.Wait()
	wPipe.Close()

	return err
}

func helperGetCompleteLabById(t *terraformService, labType string, labId string) (entity.LabType, error) {
	lab := entity.LabType{}

	if labType == "assignment" {
		labType = "readinesslab"
	}
	if labType == "challenge" {
		labType = "challengelab"
	}

	completeLabs, err := t.labService.GetPublicLabs(labType)
	if err != nil {
		slog.Error("not able to get complete labs", err)
		return lab, err
	}

	for _, element := range completeLabs {
		if element.Id == labId {
			return element, nil
		}
	}

	return lab, errors.New("complete lab not found")
}
