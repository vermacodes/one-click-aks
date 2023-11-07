package service

import (
	"strings"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type workspaceService struct {
	workspaceRepository   entity.WorkspaceRepository
	storageAccountService entity.StorageAccountService // Some information is needed from storage account service.
	actionStatusService   entity.ActionStatusService
}

func NewWorkspaceService(workspaceRepo entity.WorkspaceRepository, storageAccountService entity.StorageAccountService, actionStatusService entity.ActionStatusService) entity.WorkspaceService {
	return &workspaceService{
		workspaceRepository:   workspaceRepo,
		storageAccountService: storageAccountService,
		actionStatusService:   actionStatusService,
	}
}

func (w *workspaceService) List() ([]entity.Workspace, error) {
	workspaces := []entity.Workspace{}

	// Send workspaces from redis.
	val, err := w.workspaceRepository.GetListFromRedis()
	if err == nil {
		return helperStringToWorkspaces(val), nil
	}

	// rest of the function will be executed only if the workspace was not found in redis.

	storageAccountName, err := w.storageAccountService.GetStorageAccountName()

	if err != nil {
		slog.Error("Not able to get storage account name", err)
		return workspaces, err
	}

	val, err = w.workspaceRepository.List(storageAccountName)
	if err != nil {
		slog.Error("Not able to list workspaces", err)
		return workspaces, err
	}

	if val == "" {
		slog.Error("No workspaces found", err)
		return workspaces, err
	}

	// Adding workspaces in redis.
	w.workspaceRepository.AddListToRedis(val)

	return helperStringToWorkspaces(val), nil
}

func (w *workspaceService) GetSelectedWorkspace() (entity.Workspace, error) {
	workspaces, err := w.List()
	if err != nil {
		return entity.Workspace{}, err
	}

	for _, workspace := range workspaces {
		if workspace.Selected {
			return workspace, nil
		}
	}

	return entity.Workspace{}, nil

}

func (w *workspaceService) Add(workspace entity.Workspace) error {

	if err := w.workspaceRepository.Add(workspace); err != nil {
		slog.Error("not able to add workspace", err)
		return err
	}

	// Since we just updated the workspaces, Redis info is now stale.
	// Remove it so that it gets updated correctly.
	w.workspaceRepository.DeleteListFromRedis()
	w.workspaceRepository.DeleteResourcesFromRedis()

	return nil
}

func (w *workspaceService) Select(workspace entity.Workspace) error {

	// add workspace if not exists

	if err := w.workspaceRepository.Select(workspace); err != nil {
		slog.Error("not able to select the workspace", err)
		return err
	}

	w.workspaceRepository.DeleteListFromRedis()
	w.workspaceRepository.DeleteResourcesFromRedis()
	return nil
}

func (w *workspaceService) Delete(workspace entity.Workspace) error {
	if err := w.workspaceRepository.Delete(workspace); err != nil {
		slog.Error("not able to delete workspace", err)
		return err
	}

	w.workspaceRepository.DeleteListFromRedis()
	w.workspaceRepository.DeleteResourcesFromRedis()
	return nil
}

func (w *workspaceService) Resources() (string, error) {

	// Get resources from redis.
	resources, err := w.workspaceRepository.GetResourcesFromRedis()
	if err == nil {
		return resources, err
	}

	// rest of the function executes only if resources not found in redis.

	storageAccountName, err := w.storageAccountService.GetStorageAccountName()

	if err != nil {
		slog.Error("Not able to get storage account name", err)
		return "", err
	}
	resources, err = w.workspaceRepository.Resources(storageAccountName)
	if err != nil {
		slog.Error("not able to get resources", err)
	}

	w.workspaceRepository.AddResourcesToRedis(resources)
	return resources, err
}

func (w *workspaceService) DeleteAllWorkspaceFromRedis() error {
	w.workspaceRepository.DeleteListFromRedis()
	w.workspaceRepository.DeleteResourcesFromRedis()
	return nil
}

// this is a helper function which takes a string (output from the command)
// and converts to a list of workspaces.
func helperStringToWorkspaces(val string) []entity.Workspace {
	slog.Debug("Workspaces : " + val)
	workspaces := []entity.Workspace{}
	sliceOut := strings.Split(string(val), ",")
	for _, v := range sliceOut {

		var workspace = new(entity.Workspace)
		workspace.Selected = false

		// Check for selected workspace and remove leading [* ] or remove the leading space
		if strings.HasPrefix(v, "*") {
			workspace.Selected = true
			v = strings.Split(v, "* ")[1]
		} else {
			// Removes the leading whitespace.
			v = strings.Split(v, " ")[1]
		}

		// Add workspace name.
		workspace.Name = v

		// Append workspace.
		workspaces = append(workspaces, *workspace)
	}

	return workspaces
}
