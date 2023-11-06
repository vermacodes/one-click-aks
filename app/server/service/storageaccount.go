package service

import (
	"encoding/json"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type storageAccountService struct {
	storageAccountRepository entity.StorageAccountRepository
}

func NewStorageAccountService(storageAccountRepo entity.StorageAccountRepository) entity.StorageAccountService {
	return &storageAccountService{
		storageAccountRepository: storageAccountRepo,
	}
}

func (s *storageAccountService) GetStorageAccountName() (string, error) {

	// Give Storage Account Name Redis.
	val, err := s.storageAccountRepository.GetStorageAccountNameFromRedis()
	if err == nil {
		slog.Debug("storage account name found in redis.")
		return val, nil
	}

	slog.Debug("storage account name was not found in redis.")
	// Get storage account name from CLI.
	val, err = s.storageAccountRepository.GetStorageAccountName()
	if err != nil || val == "" {
		slog.Error("not able to get storage account name", err)
		return val, err
	}

	// Set storage account name in redis.
	slog.Debug("adding storage account name to redis")
	s.storageAccountRepository.SetStorageAccountNameInRedis(val)
	return val, err
}

func (s *storageAccountService) GetBlobContainer(storageAccountName string, containerName string) (entity.BlobContainer, error) {
	blobContainer := entity.BlobContainer{}

	out, err := s.storageAccountRepository.GetBlobContainerFromRedis()
	if err == nil {
		slog.Debug("blob container found in redis")
		helperStringToBlobContainer(out, &blobContainer)
		return blobContainer, err
	}

	// Following will only be run if not found in redis.
	out, err = s.storageAccountRepository.GetBlobContainer(storageAccountName, containerName)
	if err != nil || out == "" {
		slog.Error("not able to get blob container", err)
		return blobContainer, err
	}

	slog.Debug("adding blob container to redis.")
	s.storageAccountRepository.SetBlobContainerInRedis(out)

	helperStringToBlobContainer(out, &blobContainer)
	return blobContainer, err
}

func (s *storageAccountService) GetResourceGroup() (entity.ResourceGroup, error) {
	resourceGroup := entity.ResourceGroup{}

	out, err := s.storageAccountRepository.GetResourceGroupFromRedis()
	if err == nil {
		slog.Debug("resource group found in redis")
		helperStringToResourceGroup(out, &resourceGroup)
		return resourceGroup, err
	}

	// Rest of function executed only if rg not cound in redis.

	out, err = s.storageAccountRepository.GetResourceGroup()
	if err != nil || out == "" {
		slog.Error("not able to get resource group from cli", err)
		return resourceGroup, err
	}

	slog.Debug("setting resource group in redis.")
	s.storageAccountRepository.SetResourceGroupInRedis(out)

	helperStringToResourceGroup(out, &resourceGroup)
	return resourceGroup, nil
}

func (s *storageAccountService) GetStorageAccount(storageAccountName string) (entity.StorageAccount, error) {
	storageAccount := entity.StorageAccount{}

	out, err := s.storageAccountRepository.GetStorageAccountFromRedis()
	if err == nil {
		slog.Debug("storage account found in redis")
		helperStringToStorageAccount(out, &storageAccount)
		return storageAccount, err
	}

	// rest of function is exectued only if storage account is not found in redis.

	out, err = s.storageAccountRepository.GetStorageAccount(storageAccountName)
	if err != nil || out == "" {
		slog.Error("not able to get storage account by running azure cli command", err)
		return storageAccount, err
	}

	slog.Debug("added storage account to redis.")
	s.storageAccountRepository.SetStorageAccountInRedis(out)

	helperStringToStorageAccount(out, &storageAccount)
	return storageAccount, nil
}

// Create resource group.
// This first checks if there is an existing resource group.
// if found just return that, if not found create one.
func (s *storageAccountService) CreateResourceGroup() (entity.ResourceGroup, error) {
	resourceGroup := entity.ResourceGroup{}

	// if there exists a resource group, just return that.
	out, err := s.storageAccountRepository.GetResourceGroup()
	if err == nil {
		slog.Debug("resource group alredy exists")
		helperStringToResourceGroup(out, &resourceGroup)
		return resourceGroup, nil
	}

	out, err = s.storageAccountRepository.CreateResourceGroup()
	if err != nil || out == "" {
		slog.Error("not able to create resource group", err)
		return resourceGroup, err
	}

	slog.Debug("resource group created")
	s.storageAccountRepository.SetResourceGroupInRedis(out)
	helperStringToResourceGroup(out, &resourceGroup)
	return resourceGroup, nil
}

// Create Storage Account.
// Creates only if there isn't one storage acccount in RG.
func (s *storageAccountService) CreateStorageAccount(storageAccountName string) (entity.StorageAccount, error) {
	storageAccount := entity.StorageAccount{}

	// If storage account exists, just return that.
	out, err := s.storageAccountRepository.GetStorageAccountName()
	if err == nil && out != "" {
		slog.Debug("Storage account already present")
		out, _ = s.storageAccountRepository.GetStorageAccount(out)
		helperStringToStorageAccount(out, &storageAccount)
		return storageAccount, nil
	}

	out, err = s.storageAccountRepository.CreateStorageAccount(storageAccountName)
	if err != nil || out == "" {
		slog.Error("not able to create storage account", err)
		return storageAccount, err
	}

	slog.Info("storage account %v created", storageAccountName)
	s.storageAccountRepository.SetStorageAccountInRedis(out)

	helperStringToStorageAccount(out, &storageAccount)
	return storageAccount, err
}

/**
Create Blob Container.
- Creates blob container in storage account.
- If there exists tfstate already, then it wont take any action.
*/

func (s *storageAccountService) CreateBlobContainer(storageAccountName string, containerName string) (entity.BlobContainer, error) {
	blobContainer := entity.BlobContainer{}

	out, err := s.storageAccountRepository.GetBlobContainer(storageAccountName, containerName)
	if err == nil {
		slog.Debug("container alreay present")
		helperStringToBlobContainer(out, &blobContainer)
		return blobContainer, nil
	}

	out, err = s.storageAccountRepository.CreateBlobContainer(storageAccountName, containerName)
	if err != nil || out == "" {
		slog.Error("not able to create blob container "+containerName+" in storage account"+storageAccountName, err)
	}

	slog.Info("blob container " + containerName + " created in storage account " + storageAccountName)
	s.storageAccountRepository.SetBlobContainerInRedis(out)

	helperStringToBlobContainer(out, &blobContainer)
	return blobContainer, nil
}

func (s *storageAccountService) BreakBlobLease(storageAccountName string, containerName string, workspaceName string) error {

	// If workspace name is default, then blob name is terraform.tfstate
	// else it is terraform.tfstateenv:<workspaceName>
	blobName := "terraform.tfstate"
	if workspaceName != "default" {
		blobName = "terraform.tfstateenv:" + workspaceName
	}

	err := s.storageAccountRepository.BreakBlobLease(storageAccountName, containerName, blobName)
	if err != nil {
		slog.Error("not able to break blob lease", err)
		return err
	}

	slog.Debug("state lease broken for workspace " + workspaceName + " in storage account " + storageAccountName + " in container " + containerName)
	return nil
}

func helperStringToBlobContainer(val string, blobContainer *entity.BlobContainer) {
	slog.Debug("converting from string to blob container type")
	json.Unmarshal([]byte(val), &blobContainer)
}

func helperStringToResourceGroup(val string, resourceGroup *entity.ResourceGroup) {
	slog.Debug("converting from string to resource group type")
	json.Unmarshal([]byte(val), &resourceGroup)
}

func helperStringToStorageAccount(val string, storageAccount *entity.StorageAccount) {
	slog.Debug("converting from string to storage account type")
	json.Unmarshal([]byte(val), &storageAccount)
}
