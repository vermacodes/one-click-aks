package entity

type Properties struct {
	ProvisioningState string `json:"provisioningState"`
}

type ResourceGroup struct {
	Id         string     `json:"id"`
	Location   string     `json:"location"`
	ManagedBy  string     `json:"managedBy"`
	Name       string     `json:"name"`
	Properties Properties `json:"properties"`
	Tags       string     `json:"tags"`
	Type       string     `json:"type"`
}

type StorageAccount struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type BlobContainer struct {
	Name string `json:"name"`
}

type StateConfiguration struct {
	ResourceGroup  ResourceGroup  `json:"resourceGroup"`
	StorageAccount StorageAccount `json:"storageAccount"`
	BlobContainer  BlobContainer  `json:"blobContainer"`
}

type StateConfigurationStatus struct {
	IsStateConfigured bool `json:"isStateConfigured"`
}

type StorageAccountService interface {
	GetStorageAccountName() (string, error)
	GetBlobContainer(storageAccountName string, containerName string) (BlobContainer, error)
	GetResourceGroup() (ResourceGroup, error)
	GetStorageAccount(storageAccountName string) (StorageAccount, error)

	// Mutating Operations

	CreateResourceGroup() (ResourceGroup, error)
	CreateStorageAccount(storageAccountName string) (StorageAccount, error)
	CreateBlobContainer(storageAccountName string, containerName string) (BlobContainer, error)
	BreakBlobLease(storageAccountName string, containerName string, workspaceName string) error
}

type StorageAccountRepository interface {
	GetStorageAccountName() (string, error)
	GetStorageAccountNameFromRedis() (string, error)
	SetStorageAccountNameInRedis(val string) error
	DelStorageAccountNameFromRedis() error

	GetBlobContainer(storageAccountName string, containerName string) (string, error)
	GetBlobContainerFromRedis() (string, error)
	SetBlobContainerInRedis(val string) error
	DelBlobContainerFromRedis() error

	GetResourceGroup() (string, error)
	GetResourceGroupFromRedis() (string, error)
	SetResourceGroupInRedis(val string) error
	DelResourceGroupFromRedis() error

	GetStorageAccount(storageAccountName string) (string, error)
	GetStorageAccountFromRedis() (string, error)
	SetStorageAccountInRedis(val string) error
	DelStorageAccountFromRedis() error

	// Mutating Operations

	CreateResourceGroup() (string, error)
	CreateStorageAccount(storageAccountName string) (string, error)
	CreateBlobContainer(storageAccountName string, containerName string) (string, error)
	BreakBlobLease(storageAccountName string, containerName string, blobName string) error
}
