package repository

import (
	"os/exec"
	"strings"

	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type storageAccountRepository struct{}

func NewStorageAccountRepository() entity.StorageAccountRepository {
	return &storageAccountRepository{}
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
	return getRedis("storageAccountName")
}

// This sets storage account name in redis.
func (s *storageAccountRepository) SetStorageAccountNameInRedis(val string) error {
	return setRedis("storageAccountName", val)
}

func (s *storageAccountRepository) DelStorageAccountNameFromRedis() error {
	return deleteRedis("storageAccountName")
}

// Blob Container
func (s *storageAccountRepository) GetBlobContainer(storageAccountName string, containerName string) (string, error) {
	out, err := exec.Command("bash", "-c", "az storage container show -n "+containerName+" --account-name "+storageAccountName+" --output json").Output()
	return string(out), err
}

func (s *storageAccountRepository) GetBlobContainerFromRedis() (string, error) {
	return getRedis("blobcontainer")
}

func (s *storageAccountRepository) SetBlobContainerInRedis(val string) error {
	return setRedis("blobcontainer", val)
}

func (s *storageAccountRepository) DelBlobContainerFromRedis() error {
	return deleteRedis("blobcontainer")
}

// Resource Group
func (s *storageAccountRepository) GetResourceGroup() (string, error) {
	out, err := exec.Command("bash", "-c", "az group show --name repro-project --output json").Output()
	return string(out), err
}

func (s *storageAccountRepository) GetResourceGroupFromRedis() (string, error) {
	return getRedis("resourcegroup")
}

func (s *storageAccountRepository) SetResourceGroupInRedis(val string) error {
	return setRedis("resourcegroup", val)
}

func (s *storageAccountRepository) DelResourceGroupFromRedis() error {
	return deleteRedis("resourcegroup")
}

// Storage Account
func (s *storageAccountRepository) GetStorageAccount(storageAccountName string) (string, error) {
	out, err := exec.Command("bash", "-c", "az storage account show -g repro-project --name "+storageAccountName+" --output json").Output()
	return string(out), err
}

func (s *storageAccountRepository) GetStorageAccountFromRedis() (string, error) {
	return getRedis("storageaccount")
}

func (s *storageAccountRepository) SetStorageAccountInRedis(val string) error {
	return setRedis("storageaccount", val)
}

func (s *storageAccountRepository) DelStorageAccountFromRedis() error {
	return deleteRedis("storageaccount")
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
