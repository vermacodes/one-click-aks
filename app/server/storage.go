package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
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

// func getResourceGroup(w http.ResponseWriter, r *http.Request) {

// 	enableCors(&w)
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)

// 	resourceGroup := ResourceGroup{}

// 	out, err := exec.Command("bash", "-c", "az group show --name repro-project --output json").Output()

// 	if err != nil {
// 		fmt.Println("Get Resourece Group - Not able to run az cli command")
// 		log.Println("Error output from comamnd : ", err)
// 	}

// 	fmt.Println(string(out))

// 	err = json.Unmarshal(out, &resourceGroup)
// 	if err != nil {
// 		log.Println("Error Unmarshelling : ", err)
// 	}

// 	resourceGroupJson, err := json.Marshal(resourceGroup)
// 	if err != nil {
// 		log.Println(err)
// 	}

// 	w.Write(resourceGroupJson)
// }

func getStorageAccountName() string {
	out, err := exec.Command("bash", "-c", "az storage account list -g repro-project --output tsv --query [].name").Output()

	if err != nil {
		fmt.Println("List Storage Accounts - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	return strings.TrimSuffix(string(out), "\n")
}

// func getStorageAccount(w http.ResponseWriter, r *http.Request) {

// 	enableCors(&w)
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)

// 	storageAccount := StorageAccount{}

// 	storageAccountName := getStorageAccountName()

// 	log.Println("Storage Account Name : ", storageAccountName)
// 	log.Println("Next command : ", "az storage account show -g repro-project --name "+storageAccountName+" --output json")

// 	out, err := exec.Command("bash", "-c", "az storage account show -g repro-project --name "+storageAccountName+" --output json").Output()

// 	if err != nil {
// 		fmt.Println("Show Storage Account - Not able to run az cli command")
// 		log.Println("Error output from comamnd : ", err)
// 	}

// 	fmt.Println(string(out))

// 	err = json.Unmarshal(out, &storageAccount)
// 	if err != nil {
// 		log.Println("Error Unmarshelling : ", err)
// 	}

// 	storageAccountJson, err := json.Marshal(storageAccount)
// 	if err != nil {
// 		log.Println(err)
// 	}

// 	w.Write(storageAccountJson)
// }

// func createStorageAccunt(w http.ResponseWriter, r *http.Request) {

// 	enableCors(&w)
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)

// 	storageAccount := StorageAccount{}

// 	storageAccountName := generate(12)
// 	log.Println("Storage Account Name : ", storageAccountName)
// 	log.Println("Command : ", "az storage account create -g repro-project --name "+storageAccountName+" --kind StorageV2 --sku Standard_LRS --output json")

// 	out, err := exec.Command("bash", "-c", "az storage account create -g repro-project --name "+storageAccountName+" --kind StorageV2 --sku Standard_LRS --output json").Output()

// 	if err != nil {
// 		fmt.Println("Create Storage account - Not able to run az cli command")
// 		log.Println("Error output from comamnd : ", err)
// 	}

// 	fmt.Println(string(out))

// 	err = json.Unmarshal(out, &storageAccount)
// 	if err != nil {
// 		log.Println("Error Unmarshelling : ", err)
// 	}

// 	storageAccountJson, err := json.Marshal(storageAccount)
// 	if err != nil {
// 		log.Println(err)
// 	}

// 	w.Write(storageAccountJson)
// }

func getBlobContainer(storageAccountName string, containerName string) BlobContainer {
	log.Println("Getting BlobContainer Details")
	log.Println("Command : az storage container show -n " + containerName + " --account-name " + storageAccountName + " --output json")

	container := BlobContainer{}

	out, err := exec.Command("bash", "-c", "az storage container show -n "+containerName+" --account-name "+storageAccountName+" --output json").Output()

	if err != nil {
		fmt.Println("Show Storage Account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	fmt.Println(string(out))

	err = json.Unmarshal(out, &container)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	return container
}

// func createBlobContainer(w http.ResponseWriter, r *http.Request) {

// 	enableCors(&w)
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)

// 	storageAccountName := getStorageAccountName()

// 	log.Println("Storage Account Name : ", storageAccountName)
// 	log.Println("Command : ", "az storage container create -n tfstate -g repro-project --account-name "+storageAccountName+" --output tsv --query created")

// 	out, err := exec.Command("bash", "-c", "az storage container create -n tfstate -g repro-project --account-name "+storageAccountName+" --output tsv --query created").Output()

// 	if err != nil {
// 		fmt.Println("Create Storage account - Not able to run az cli command")
// 		log.Println("Error output from comamnd : ", err)
// 	}

// 	if string(out) == "true" {
// 		log.Println("BlobContainer created.")
// 	}

// 	container := getBlobContainer(storageAccountName, "tfstate")

// 	containerJson, err := json.Marshal(container)
// 	if err != nil {
// 		log.Println(err)
// 	}

// 	w.Write(containerJson)
// }

// func getBlobContainerApi(w http.ResponseWriter, r *http.Request) {

// 	enableCors(&w)
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)

// 	container := getBlobContainer(getStorageAccountName(), "tfstate")

// 	containerJson, err := json.Marshal(container)
// 	if err != nil {
// 		log.Println(err)
// 	}

// 	w.Write(containerJson)
// }

// func createResourceGroup(w http.ResponseWriter, r *http.Request) {
// 	enableCors(&w)
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)

// 	resourceGroup := ResourceGroup{}

// 	out, err := exec.Command("bash", "-c", "az group create -l eastus -n repro-project -o json").Output()

// 	if err != nil {
// 		fmt.Println("Create Resource Group - Not able to run az cli command")
// 		log.Println("Error output from comamnd : ", err)
// 	}

// 	fmt.Println(string(out))

// 	err = json.Unmarshal(out, &resourceGroup)
// 	if err != nil {
// 		log.Println("Error Unmarshelling : ", err)
// 	}

// 	resourceGroupJson, err := json.Marshal(resourceGroup)
// 	if err != nil {
// 		log.Println(err)
// 	}

// 	w.Write(resourceGroupJson)
// }

func _createResourceGroup() ResourceGroup {

	resourceGroup := ResourceGroup{}
	log.Println("Create Resource Group")
	log.Println("Command : az group create -l eastus -n repro-project -o json")

	out, err := exec.Command("bash", "-c", "az group create -l eastus -n repro-project -o json").Output()

	if err != nil {
		fmt.Println("Create Resourece Group - Not able to run az cli command")
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
		fmt.Println("Show Storage Account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	err = json.Unmarshal(out, &storageAccount)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	return storageAccount
}

func _createBlobContainer() BlobContainer {

	storageAccountName := getStorageAccountName()

	log.Println("Storage Account Name : ", storageAccountName)
	log.Println("Command : ", "az storage container create -n tfstate -g repro-project --account-name "+storageAccountName+" --output tsv --query created")

	out, err := exec.Command("bash", "-c", "az storage container create -n tfstate -g repro-project --account-name "+storageAccountName+" --output tsv --query created").Output()

	if err != nil {
		fmt.Println("Create Storage account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	if string(out) == "true" {
		log.Println("BlobContainer created.")
	}

	return getBlobContainer(storageAccountName, "tfstate")
}

func _getResourceGroup() ResourceGroup {

	resourceGroup := ResourceGroup{}
	log.Println("Get Resource Group")
	log.Println("Command : az group show --name repro-project --output json")

	out, err := exec.Command("bash", "-c", "az group show --name repro-project --output json").Output()

	if err != nil {
		fmt.Println("Get Resourece Group - Not able to run az cli command")
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
		fmt.Println("Show Storage Account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	err = json.Unmarshal(out, &storageAccount)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	return storageAccount
}

// func isResourceGroupCreated() bool {
// 	return _getResourceGroup().Name != ""
// }

// func isStorageAccountCreated() bool {
// 	return _getStorageAccount().Name != ""
// }

// func isBlobContainerCreated() bool {
// 	return (getBlobContainer(_getStorageAccount().Name, "tfstate").Name == "tfstate")
// }

// func isStateConfigured(w http.ResponseWriter, r *http.Request) {
// 	enableCors(&w)
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)

// 	stateConfigurationStatus := StateConfigurationStatus{}
// 	stateConfigurationStatus.IsStateConfigured = isBlobContainerCreated()

// 	stateConfigurationStatusJson, err := json.Marshal(stateConfigurationStatus)
// 	if err != nil {
// 		log.Println(err)
// 	}

// 	w.Write(stateConfigurationStatusJson)
// }

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
	stateConfiguration.BlobContainer = _createBlobContainer()

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
