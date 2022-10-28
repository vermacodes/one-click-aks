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

type Container struct {
	Name string `json:"name"`
}

func getResourceGroup(w http.ResponseWriter, r *http.Request) {

	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	resourceGroup := ResourceGroup{}

	out, err := exec.Command("bash", "-c", "az group show --name repro-project --output json").Output()

	if err != nil {
		fmt.Println("Get Resourece Group - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	fmt.Println(string(out))

	err = json.Unmarshal(out, &resourceGroup)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	resourceGroupJson, err := json.Marshal(resourceGroup)
	if err != nil {
		log.Println(err)
	}

	w.Write(resourceGroupJson)
}

func getStorageAccountName() string {
	out, err := exec.Command("bash", "-c", "az storage account list -g repro-project --output tsv --query [].name").Output()

	if err != nil {
		fmt.Println("List Storage Accounts - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	return strings.TrimSuffix(string(out), "\n")
}

func getStorageAccount(w http.ResponseWriter, r *http.Request) {

	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	storageAccount := StorageAccount{}

	storageAccountName := getStorageAccountName()

	log.Println("Storage Account Name : ", storageAccountName)
	log.Println("Next command : ", "az storage account show -g repro-project --name "+storageAccountName+" --output json")

	out, err := exec.Command("bash", "-c", "az storage account show -g repro-project --name "+storageAccountName+" --output json").Output()

	if err != nil {
		fmt.Println("Show Storage Account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	fmt.Println(string(out))

	err = json.Unmarshal(out, &storageAccount)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	storageAccountJson, err := json.Marshal(storageAccount)
	if err != nil {
		log.Println(err)
	}

	w.Write(storageAccountJson)
}

func createStorageAccunt(w http.ResponseWriter, r *http.Request) {

	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	storageAccount := StorageAccount{}

	storageAccountName := generate(12)
	log.Println("Storage Account Name : ", storageAccountName)
	log.Println("Command : ", "az storage account create -g repro-project --name "+storageAccountName+" --kind StorageV2 --sku Standard_LRS --output json")

	out, err := exec.Command("bash", "-c", "az storage account create -g repro-project --name "+storageAccountName+" --kind StorageV2 --sku Standard_LRS --output json").Output()

	if err != nil {
		fmt.Println("Create Storage account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	fmt.Println(string(out))

	err = json.Unmarshal(out, &storageAccount)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	storageAccountJson, err := json.Marshal(storageAccount)
	if err != nil {
		log.Println(err)
	}

	w.Write(storageAccountJson)
}

func getContainer(storageAccountName string, containerName string) Container {
	log.Println("Getting Container Details")
	log.Println("Command : az storage container show -n " + containerName + " --account-name " + storageAccountName + " --output json")

	container := Container{}

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

func createBlobContainer(w http.ResponseWriter, r *http.Request) {

	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	storageAccountName := getStorageAccountName()

	log.Println("Storage Account Name : ", storageAccountName)
	log.Println("Command : ", "az storage container create -n tfstate -g repro-project --account-name "+storageAccountName+" --output tsv --query created")

	out, err := exec.Command("bash", "-c", "az storage container create -n tfstate -g repro-project --account-name "+storageAccountName+" --output tsv --query created").Output()

	if err != nil {
		fmt.Println("Create Storage account - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	if string(out) == "true" {
		log.Println("Container created.")
	}

	container := getContainer(storageAccountName, "tfstate")

	containerJson, err := json.Marshal(container)
	if err != nil {
		log.Println(err)
	}

	w.Write(containerJson)
}

func getContainerApi(w http.ResponseWriter, r *http.Request) {

	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	container := getContainer(getStorageAccountName(), "tfstate")

	containerJson, err := json.Marshal(container)
	if err != nil {
		log.Println(err)
	}

	w.Write(containerJson)
}

func createResourceGroup(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	resourceGroup := ResourceGroup{}

	out, err := exec.Command("bash", "-c", "az group create -l eastus -n repro-project -o json").Output()

	if err != nil {
		fmt.Println("Create Resource Group - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	fmt.Println(string(out))

	err = json.Unmarshal(out, &resourceGroup)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	resourceGroupJson, err := json.Marshal(resourceGroup)
	if err != nil {
		log.Println(err)
	}

	w.Write(resourceGroupJson)
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
