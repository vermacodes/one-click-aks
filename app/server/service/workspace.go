package service

import (
	"strings"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type workspaceService struct {
	workspaceRepository   entity.WorkspaceRepository
	storageAccountService entity.StorageAccountService // Some information is needed from storage aacount service.
}

func NewWorksapceService(workspaceRepo entity.WorkspaceRepository, storageAccountService entity.StorageAccountService) entity.WorkspaceService {
	return &workspaceService{
		workspaceRepository:   workspaceRepo,
		storageAccountService: storageAccountService,
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

	// Adding workspaces in redis.
	w.workspaceRepository.AddListToRedis(val)

	return helperStringToWorkspaces(val), nil
}

func (w *workspaceService) Add(workspace entity.Workspace) error {
	if err := w.workspaceRepository.Add(workspace); err != nil {
		slog.Error("not able to add workspace", err)
	}

	// Since we just updated the workspaces, Redis info is now stale.
	// Remove it so that it gets updated correctly.
	w.workspaceRepository.DeleteListFromRedis()
	w.workspaceRepository.DeleteResourcesFromRedis()
	return nil
}

func (w *workspaceService) Select(workspace entity.Workspace) error {
	if err := w.workspaceRepository.Select(workspace); err != nil {
		slog.Error("not able to select the workspace", err)
		return err
	}
	w.workspaceRepository.DeleteResourcesFromRedis()
	return nil
}

func (w *workspaceService) Delete(workspace entity.Workspace) error {
	if err := w.workspaceRepository.Delete(workspace); err != nil {
		slog.Error("not able to delete workspace", err)
		return err
	}
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
		slog.Error("not able to get resouces", err)
	}

	w.workspaceRepository.AddResourcesToRedis(resources)
	return resources, err
}

// this is a hleper function which takes a string (output from the commmand)
// and converts to a list of workspaces.
func helperStringToWorkspaces(val string) []entity.Workspace {
	slog.Info("workspaces -> " + val)
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
