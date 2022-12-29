package repository

import (
	"os"
	"os/exec"

	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type tfWorkspaceRepository struct{}

func NewTfWorkspaceRepository() entity.WorkspaceRepository {
	return &tfWorkspaceRepository{}
}

func (t *tfWorkspaceRepository) List(storageAccountName string) (string, error) {
	setEnvironmentVariable("terraform_directory", "tf")
	setEnvironmentVariable("root_directory", os.ExpandEnv("$ROOT_DIR"))
	setEnvironmentVariable("resource_group_name", "repro-project")
	setEnvironmentVariable("storage_account_name", storageAccountName)
	setEnvironmentVariable("container_name", "tfstate")
	setEnvironmentVariable("tf_state_file_name", "terraform.tfstate")

	out, err := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/workspaces.sh", "list").Output()
	return string(out), err
}

func (t *tfWorkspaceRepository) GetListFromRedis() (string, error) {
	return getRedis("terraformWorkspaces")
}

func (t *tfWorkspaceRepository) AddListToRedis(val string) {
	setRedis("terraformWorkspaces", val)
}

func (t *tfWorkspaceRepository) DeleteListFromRedis() {
	deleteRedis("terraformWorkspaces")
}

func (t *tfWorkspaceRepository) Add(workspace entity.Workspace) error {
	_, err := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/workspaces.sh", "new", workspace.Name).Output()
	return err
}

func (t *tfWorkspaceRepository) Select(workspace entity.Workspace) error {
	_, err := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/workspaces.sh", "select", workspace.Name).Output()
	return err
}

func (t *tfWorkspaceRepository) Delete(workspace entity.Workspace) error {
	_, err := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/workspaces.sh", "delete", workspace.Name).Output()
	return err
}

func (t *tfWorkspaceRepository) Resources(storageAccountName string) (string, error) {
	setEnvironmentVariable("terraform_directory", "tf")
	setEnvironmentVariable("root_directory", os.ExpandEnv("$ROOT_DIR"))
	setEnvironmentVariable("resource_group_name", "repro-project")
	setEnvironmentVariable("storage_account_name", storageAccountName)
	setEnvironmentVariable("container_name", "tfstate")
	setEnvironmentVariable("tf_state_file_name", "terraform.tfstate")

	out, err := exec.Command("bash", "-c", "cd "+os.ExpandEnv("$ROOT_DIR")+"/tf; terraform state list").Output()
	return string(out), err
}

func (t *tfWorkspaceRepository) GetResourcesFromRedis() (string, error) {
	return getRedis("terraformResources")
}

func (t *tfWorkspaceRepository) AddResourcesToRedis(val string) {
	setRedis("terraformResources", val)
}

func (t *tfWorkspaceRepository) DeleteResourcesFromRedis() {
	deleteRedis("terraformResources")
}
