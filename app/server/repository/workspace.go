package repository

import (
	"context"
	"os"
	"os/exec"

	"github.com/go-redis/redis/v9"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type tfWorkspaceRepository struct{}

func NewTfWorkspaceRepository() entity.WorkspaceRepository {
	return &tfWorkspaceRepository{}
}

var tfWorkspaceCtx = context.Background()

func newTfWorkspaceRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
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
	rdb := newTfWorkspaceRedisClient()
	return rdb.Get(tfWorkspaceCtx, "terraformWorkspaces").Result()
}

func (t *tfWorkspaceRepository) AddListToRedis(val string) {
	rdb := newTfWorkspaceRedisClient()
	rdb.Set(tfWorkspaceCtx, "terraformWorkspaces", val, 0)
}

func (t *tfWorkspaceRepository) DeleteListFromRedis() {
	rdb := newTfWorkspaceRedisClient()
	rdb.Del(tfWorkspaceCtx, "terraformWorkspaces")
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
	rdb := newTfWorkspaceRedisClient()
	return rdb.Get(tfWorkspaceCtx, "terraformResources").Result()
}

func (t *tfWorkspaceRepository) AddResourcesToRedis(val string) {
	rdb := newTfWorkspaceRedisClient()
	rdb.Set(tfWorkspaceCtx, "terraformResources", val, 0)
}

func (t *tfWorkspaceRepository) DeleteResourcesFromRedis() {
	rdb := newTfWorkspaceRedisClient()
	rdb.Del(tfWorkspaceCtx, "terraformResources")
}
