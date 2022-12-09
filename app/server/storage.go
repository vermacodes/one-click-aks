package main

import (
	"crypto/rand"
	"encoding/json"
	"log"
	"net/http"
	"os/exec"
	"strings"
	"unsafe"

	"github.com/gin-gonic/gin"
)

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

func getStorageAccountName() string {
	out, err := exec.Command("bash", "-c", "az storage account list -g repro-project --output tsv --query [].name").Output()

	if err != nil {
		log.Println("List Storage Accounts - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	return strings.TrimSuffix(string(out), "\n")
}

func getBlobContainer(storageAccountName string, containerName string) BlobContainer {
	log.Println("Getting BlobContainer Details")
	log.Println("Command : az storage container show -n " + containerName + " --account-name " + storageAccountName + " --output json")

	container := BlobContainer{}

	out, err := exec.Command("bash", "-c", "az storage container show -n "+containerName+" --account-name "+storageAccountName+" --output json").Output()

	if err != nil {
		log.Println("Show Storage Account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	log.Println(string(out))

	err = json.Unmarshal(out, &container)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	return container
}

func _createResourceGroup() ResourceGroup {

	resourceGroup := ResourceGroup{}
	log.Println("Create Resource Group")
	log.Println("Command : az group create -l eastus -n repro-project -o json")

	out, err := exec.Command("bash", "-c", "az group create -l eastus -n repro-project -o json").Output()

	if err != nil {
		log.Println("Create Resourece Group - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	err = json.Unmarshal(out, &resourceGroup)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	return resourceGroup
}

func _createStorageAccount() StorageAccount {

	storageAccount := StorageAccount{}

	storageAccountName := getStorageAccountName()
	if storageAccountName == "" {
		storageAccountName = generate(12)
	}

	log.Println("Create Storage Account")
	log.Println("Storage Account Name : ", storageAccountName)
	log.Println("Command : ", "az storage account create -g repro-project --name "+storageAccountName+" --kind StorageV2 --sku Standard_LRS --output json")

	out, err := exec.Command("bash", "-c", "az storage account create -g repro-project --name "+storageAccountName+" --kind StorageV2 --sku Standard_LRS --output json").Output()

	if err != nil {
		log.Println("Show Storage Account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	err = json.Unmarshal(out, &storageAccount)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	return storageAccount
}

func _createBlobContainer(containerName string) BlobContainer {

	storageAccountName := getStorageAccountName()

	log.Println("Storage Account Name : ", storageAccountName)
	log.Println("Command : ", "az storage container create -n "+containerName+" -g repro-project --account-name "+storageAccountName+" --output tsv --query created")

	out, err := exec.Command("bash", "-c", "az storage container create -n "+containerName+" -g repro-project --account-name "+storageAccountName+" --output tsv --query created").Output()

	if err != nil {
		log.Println("Create Storage account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	if string(out) == "true" {
		log.Println("BlobContainer created.")
	}

	return getBlobContainer(storageAccountName, containerName)
}

func _getResourceGroup() ResourceGroup {

	resourceGroup := ResourceGroup{}
	log.Println("Get Resource Group")
	log.Println("Command : az group show --name repro-project --output json")

	out, err := exec.Command("bash", "-c", "az group show --name repro-project --output json").Output()

	if err != nil {
		log.Println("Get Resourece Group - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	err = json.Unmarshal(out, &resourceGroup)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	return resourceGroup
}

func _getStorageAccount() StorageAccount {

	storageAccount := StorageAccount{}

	storageAccountName := getStorageAccountName()
	log.Println("Get Storage Account")
	log.Println("Storage Account Name : ", storageAccountName)
	log.Println("Command : ", "az storage account show -g repro-project --name "+storageAccountName+" --output json")

	out, err := exec.Command("bash", "-c", "az storage account show -g repro-project --name "+storageAccountName+" --output json").Output()

	if err != nil {
		log.Println("Show Storage Account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	err = json.Unmarshal(out, &storageAccount)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	return storageAccount
}

func getStateStorageConfiguration(c *gin.Context) {

	stateConfiguration := StateConfiguration{}

	stateConfiguration.ResourceGroup = _getResourceGroup()
	stateConfiguration.StorageAccount = _getStorageAccount()
	stateConfiguration.BlobContainer = getBlobContainer(stateConfiguration.StorageAccount.Name, "tfstate")

	c.IndentedJSON(http.StatusOK, stateConfiguration)
}

func configureStateStorage(c *gin.Context) {

	stateConfiguration := StateConfiguration{}

	stateConfiguration.ResourceGroup = _createResourceGroup()
	stateConfiguration.StorageAccount = _createStorageAccount()
	stateConfiguration.BlobContainer = _createBlobContainer("tfstate")
	_ = _createBlobContainer("labs") // Create container for labs but I dont care about output.

	// This configures default preferences.
	defaultPreference(stateConfiguration.StorageAccount.Name)

	c.IndentedJSON(http.StatusOK, stateConfiguration)
}

var alphabet = []byte("abcdefghijklmnopqrstuvwxyz0123456789")

func generate(size int) string {
	b := make([]byte, size)
	rand.Read(b)
	for i := 0; i < size; i++ {
		b[i] = alphabet[b[i]%byte(len(alphabet))]
	}
	return *(*string)(unsafe.Pointer(&b))
}
