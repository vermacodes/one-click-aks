package repository

import (
	"context"
	"os/exec"
	"strings"

	"github.com/go-redis/redis/v9"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type storageAccountRepository struct{}

func NewStorageAccountRepository() entity.StorageAccountRepository {
	return &storageAccountRepository{}
}

var storageAccountCtx = context.Background()

func newStorageAccountRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
}

// This returns the name of the storage account after running azure cli command.
func (s *storageAccountRepository) GetStorageAccountName() (string, error) {

	out, err := exec.Command("bash", "-c", "az storage account list -g repro-project --output tsv --query [].name").Output()
	if err != nil {
		return "", err
	}

	return strings.TrimSuffix(string(out), "\n"), nil
}

// This returns storage account name from Redis.
func (s *storageAccountRepository) GetStorageAccountNameFromRedis() (string, error) {
	rdb := newStorageAccountRedisClient()
	return rdb.Get(storageAccountCtx, "storageAccountName").Result()
}

// This sets storage account name in redis.
func (s *storageAccountRepository) SetStorageAccountNameInRedis(val string) error {
	rdb := newStorageAccountRedisClient()
	return rdb.Set(storageAccountCtx, "storageAccountName", val, 0).Err()
}

func (s *storageAccountRepository) DelStorageAccountNameFromRedis() error {
	rdb := newStorageAccountRedisClient()
	return rdb.Del(storageAccountCtx, "storageAccountName").Err()
}

// Blob Container
func (s *storageAccountRepository) GetBlobContainer(storageAccountName string, containerName string) (string, error) {
	out, err := exec.Command("bash", "-c", "az storage container show -n "+containerName+" --account-name "+storageAccountName+" --output json").Output()
	return string(out), err
}

func (s *storageAccountRepository) GetBlobContainerFromRedis() (string, error) {
	rdb := newStorageAccountRedisClient()
	return rdb.Get(storageAccountCtx, "blobcontainer").Result()
}

func (s *storageAccountRepository) SetBlobContainerInRedis(val string) error {
	rdb := newStorageAccountRedisClient()
	return rdb.Set(storageAccountCtx, "blobcontainer", val, 0).Err()
}

func (s *storageAccountRepository) DelBlobContainerFromRedis() error {
	rdb := newStorageAccountRedisClient()
	return rdb.Del(storageAccountCtx, "blobcontainer").Err()
}

// Resource Group
func (s *storageAccountRepository) GetResourceGroup() (string, error) {
	out, err := exec.Command("bash", "-c", "az group show --name repro-project --output json").Output()
	return string(out), err
}

func (s *storageAccountRepository) GetResourceGroupFromRedis() (string, error) {
	rdb := newStorageAccountRedisClient()
	return rdb.Get(storageAccountCtx, "resourcegroup").Result()
}

func (s *storageAccountRepository) SetResourceGroupInRedis(val string) error {
	rdb := newStorageAccountRedisClient()
	return rdb.Set(storageAccountCtx, "resourcegroup", val, 0).Err()
}

func (s *storageAccountRepository) DelResourceGroupFromRedis() error {
	rdb := newStorageAccountRedisClient()
	return rdb.Del(storageAccountCtx, "resourcegroup").Err()
}

// Storage Account
func (s *storageAccountRepository) GetStorageAccount(storageAccountName string) (string, error) {
	out, err := exec.Command("bash", "-c", "az storage account show -g repro-project --name "+storageAccountName+" --output json").Output()
	return string(out), err
}

func (s *storageAccountRepository) GetStorageAccountFromRedis() (string, error) {
	rdb := newStorageAccountRedisClient()
	return rdb.Get(storageAccountCtx, "storageaccount").Result()
}

func (s *storageAccountRepository) SetStorageAccountInRedis(val string) error {
	rdb := newStorageAccountRedisClient()
	return rdb.Set(storageAccountCtx, "storageaccount", val, 0).Err()
}

func (s *storageAccountRepository) DelStorageAccountFromRedis() error {
	rdb := newStorageAccountRedisClient()
	return rdb.Del(storageAccountCtx, "storageaccount").Err()
}

func (s *storageAccountRepository) CreateResoureceGroup() (string, error) {
	out, err := exec.Command("bash", "-c", "az group create -l eastus -n repro-project -o json").Output()
	return string(out), err
}

func (s *storageAccountRepository) CreateStorageAccount(storageAccountName string) (string, error) {
	out, err := exec.Command("bash", "-c", "az storage account create -g repro-project --name "+storageAccountName+" --kind StorageV2 --sku Standard_LRS --output json").Output()
	return string(out), err
}

func (s *storageAccountRepository) CreateBlobContainer(storageAccountName string, containerName string) (string, error) {
	out, err := exec.Command("bash", "-c", "az storage container create -n "+containerName+" -g repro-project --account-name "+storageAccountName+" --output tsv --query created").Output()
	return string(out), err
}
