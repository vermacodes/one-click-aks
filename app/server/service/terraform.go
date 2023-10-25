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
		slog.Error("not able to invlidate workspace cache", err)
		return err
	}

	return helperTerraformAction(t, lab.Template, "init")
}

func (t *terraformService) Plan(lab entity.LabType) error {

	// Logging
	// account, err := t.authService.GetAccount()
	// if err != nil {
	// 	slog.Error("Not able to get account", err)
	// } else {
	// 	t.loggingService.PlanRecord(account.User, lab)
	// }

	return helperTerraformAction(t, lab.Template, "plan")
}

func (t *terraformService) Apply(lab entity.LabType) error {

	// Logging
	// account, err := t.authService.GetAccount()
	// if err != nil {
	// 	slog.Error("Not able to get account", err)
	// } else {
	// 	t.loggingService.DeploymentRecord(account.User, lab)
	// }

	// Invalidate workspace cache
	if err := t.workspaceService.DeleteAllWorkspaceFromRedis(); err != nil {
		slog.Error("not able to invlidate workspace cache", err)
		return err
	}

	if err := helperTerraformAction(t, lab.Template, "apply"); err != nil {
		slog.Error("terraform apply failed", err)
		return err
	}

	return t.Extend(lab, "apply")

}

// func (t *terraformService) ApplyAsync(lab entity.LabType) (entity.TerraformOperation, error) {

// 	terraformOperation := entity.TerraformOperation{
// 		OperationId:     helper.Generate(32),
// 		OperationType:   "apply",
// 		OperationStatus: "inprogress",
// 		LabId:           lab.Id,
// 		LabName:         lab.Name,
// 		LabType:         lab.Type,
// 	}

// 	if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
// 		slog.Error("not able to set terraform operation", err)
// 		return terraformOperation, err
// 	}

// 	if len(lab.Template.KubernetesClusters) > 0 && !t.kVersionService.DoesVersionExist(lab.Template.KubernetesClusters[0].KubernetesVersion) {
// 		slog.Info("kubernetes version not found. Defaulting to default version.")
// 		lab.Template.KubernetesClusters[0].KubernetesVersion = t.kVersionService.GetDefaultVersion()
// 	}

// 	// Go routine to apply.
// 	go func() {
// 		if err := t.Apply(lab); err != nil {
// 			slog.Error("not able to apply", err)
// 			terraformOperation.OperationStatus = "failed"
// 			if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
// 				slog.Error("not able to update terraform operation", err)
// 			}
// 			return
// 		}

// 		terraformOperation.OperationStatus = "completed"
// 		slog.Info("terraform operation completed")
// 		if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
// 			slog.Error("not able to update terraform operation", err)
// 		}

// 	}()

// 	return terraformOperation, nil

// }

func (t *terraformService) Extend(lab entity.LabType, mode string) error {
	// if lab.ExtendScript == "" {
	// 	t.logStreamService.EndLogStream()
	// 	return nil
	// }

	// Getting back redacted values
	if lab.ExtendScript == "redacted" {
		lab, err := helperGetLabExerciseById(t, lab.Id)
		if err != nil {
			slog.Error("not able to find the lab exercise", err)
			return err
		}
		return helperExecuteScript(t, lab.ExtendScript, mode)
	}
	return helperExecuteScript(t, lab.ExtendScript, mode)
}

// func (t *terraformService) ExtendAsync(lab entity.LabType, mode string) (entity.TerraformOperation, error) {
// 	terraformOperation := entity.TerraformOperation{
// 		OperationId:     helper.Generate(32),
// 		OperationType:   "extend",
// 		OperationStatus: "inprogress",
// 		LabId:           lab.Id,
// 		LabName:         lab.Name,
// 		LabType:         lab.Type,
// 	}

// 	if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
// 		slog.Error("not able to set terraform operation", err)
// 		return terraformOperation, err
// 	}

// 	// Go routine to apply extend.
// 	go func() {
// 		if err := t.Extend(lab, mode); err != nil {
// 			slog.Error("not able to run extend script", err)
// 			terraformOperation.OperationStatus = "failed"
// 			if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
// 				slog.Error("not able to update terraform operation", err)
// 			}
// 			return
// 		}

// 		terraformOperation.OperationStatus = "completed"
// 		if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
// 			slog.Error("not able to update terraform operation", err)
// 		}
// 	}()

// 	return terraformOperation, nil
// }

func (t *terraformService) Destroy(lab entity.LabType) error {
	// Invalidate workspace cache
	if err := t.workspaceService.DeleteAllWorkspaceFromRedis(); err != nil {
		slog.Error("not able to invlidate workspace cache", err)
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

// func (t *terraformService) DestroyAsync(lab entity.LabType) (entity.TerraformOperation, error) {
// 	terraformOperation := entity.TerraformOperation{
// 		OperationId:     helper.Generate(32),
// 		OperationType:   "destroy",
// 		OperationStatus: "inprogress",
// 		LabId:           lab.Id,
// 		LabName:         lab.Name,
// 		LabType:         lab.Type,
// 	}

// 	if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
// 		slog.Error("not able to set terraform operation", err)
// 		return terraformOperation, err
// 	}

// 	// Go routine to destroy.
// 	go func() {
// 		if err := t.Destroy(lab); err != nil {
// 			slog.Error("not able to destroy", err)
// 			terraformOperation.OperationStatus = "failed"
// 			if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
// 				slog.Error("not able to update terraform operation", err)
// 			}
// 			return
// 		}

// 		terraformOperation.OperationStatus = "completed"
// 		if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
// 			slog.Error("not able to update terraform operation", err)
// 		}

// 	}()

// 	return terraformOperation, nil
// }

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

	storageAccountName, err := t.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return err
	}

	if len(tfvar.KubernetesClusters) > 0 && !t.kVersionService.DoesVersionExist(tfvar.KubernetesClusters[0].KubernetesVersion) {
		slog.Debug("kubernetes version not found. Defaulting to default version.")
		tfvar.KubernetesClusters[0].KubernetesVersion = t.kVersionService.GetDefaultVersion()
	}

	cmd, rPipe, wPipe, err := t.terraformRepository.TerraformAction(tfvar, action, storageAccountName)
	if err != nil {
		slog.Error("not able to run terraform script", err)
	}

	actionStaus.InProgress = true
	t.actionStatusService.SetActionStatus(actionStaus)

	// Getting current logs.
	if _, err := t.logStreamService.GetLogs(); err != nil {
		slog.Error("not able to get current logs", err)
		return err
	}

	// if err != nil {
	// 	slog.Error("not able to get current logs", err)
	// 	logStream = entity.LogStream{
	// 		Logs:        "",
	// 		IsStreaming: true,
	// 	}
	// 	return err
	// }

	// GO routine that takes care of running command and moving logs to redis.
	go func(input io.ReadCloser) {
		in := bufio.NewScanner(input)

		// Begin streaming logs if not already.
		// logStream.IsStreaming = true

		for in.Scan() {
			// Appending logs to redis.
			t.logStreamService.AppendLogs(fmt.Sprintf("%s\n", in.Text()))
			// logStream.Logs = logStream.Logs + fmt.Sprintf("%s\n", in.Text()) // Appening 'end' to signal stream end.
			// t.logStreamService.SetLogs(logStream)
		}
		input.Close()
	}(rPipe)

	err = cmd.Wait()
	wPipe.Close()
	//t.logStreamService.EndLogStream()

	actionStaus.InProgress = false
	t.actionStatusService.SetActionStatus(actionStaus)

	return err
}

func helperExecuteScript(t *terraformService, script string, mode string) error {

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

	storageAccountName, err := t.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return err
	}

	cmd, rPipe, wPipe, err := t.terraformRepository.ExecuteScript(script, mode, storageAccountName)
	if err != nil {
		slog.Error("not able to run terraform script", err)
	}

	actionStaus.InProgress = true
	t.actionStatusService.SetActionStatus(actionStaus)

	// GO routine that takes care of running command and moving logs to redis.
	go func(input io.ReadCloser) {
		in := bufio.NewScanner(input)

		// This will continue adding logs to existing logs.
		// If couldn't get existing logs, then just start from scratch.
		// If existing logs are not supposed to be shown, then client is expected to reset
		// before using APIs.
		// Getting current logs.
		if _, err := t.logStreamService.GetLogs(); err != nil {
			slog.Error("not able to get current logs", err)
			return
		}

		// logStream, err := t.logStreamService.GetLogs()
		// if err != nil {
		// 	slog.Error("not able to get logs", err)
		// 	logStream = entity.LogStream{
		// 		IsStreaming: true,
		// 		Logs:        "",
		// 	}
		// }

		for in.Scan() {
			// Appending logs to redis.
			t.logStreamService.AppendLogs(fmt.Sprintf("%s\n", in.Text()))
			// logStream.Logs = logStream.Logs + fmt.Sprintf("%s\n", in.Text()) // Appening 'end' to signal stream end.
			// t.logStreamService.SetLogs(logStream)
		}
		input.Close()
	}(rPipe)

	err = cmd.Wait()
	wPipe.Close()
	//t.logStreamService.EndLogStream()

	actionStaus.InProgress = false
	t.actionStatusService.SetActionStatus(actionStaus)

	return err
}

func helperGetLabExerciseById(t *terraformService, labId string) (entity.LabType, error) {
	lab := entity.LabType{}

	labExercises, err := t.labService.GetPublicLabs("labexercises")
	if err != nil {
		slog.Error("not able to get lab exercises", err)
		return lab, err
	}

	for _, element := range labExercises {
		if element.Id == labId {
			return element, nil
		}
	}

	return lab, errors.New("lab exercise not found")
}
