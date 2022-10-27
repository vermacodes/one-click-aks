package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
)

type User struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Tenant struct {
	TenantId string `json:"tenantId"`
}

type Account struct {
	EnvironmentName  string   `json:"environmentName"`
	HomeTenantId     string   `json:"homeTenantId"`
	Id               string   `json:"id"`
	IsDefault        bool     `json:"isDefault"`
	ManagedByTenants []Tenant `json:"managedByTenants"`
	Name             string   `json:"name"`
	State            string   `json:"state"`
	TenantId         string   `json:"tenantId"`
	User             User     `json:"user"`
}

type LoginStatus struct {
	IsLoggedIn bool `json:"isLoggedIn"`
}

type LoginMessage struct {
	LoginMessage string `json:"loginMessage"`
}

func accountLogin(w http.ResponseWriter, e *http.Request) {

	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	//loginMessage := LoginMessage{}

	cmd := exec.Command("bash", "-c", "az login --use-device-code")
	rPipe, wPipe, err := os.Pipe()
	if err != nil {
		log.Fatal(err)
	}
	cmd.Stdout = wPipe
	cmd.Stderr = wPipe
	if err := cmd.Start(); err != nil {
		log.Fatal(err)
	}
	go writeOutput(w, rPipe)
	cmd.Wait()
	wPipe.Close()
}

func accountShow(w http.ResponseWriter, e *http.Request) {

	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	var account Account

	out, err := exec.Command("bash", "-c", "az account show -o json").Output()
	if err != nil {
		fmt.Println("Not able to get account list : ", err)
	}

	err = json.Unmarshal(out, &account)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	accountJson, err := json.Marshal(account)
	if err != nil {
		log.Println("Error Marshilling : ", err)
	}
	w.Write(accountJson)
}

func accountList(w http.ResponseWriter, e *http.Request) {

	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	var accounts []Account

	out, err := exec.Command("bash", "-c", "az account list -o json").Output()
	if err != nil {
		fmt.Println("Not able to get account list : ", err)
	}

	err = json.Unmarshal(out, &accounts)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	accountsJson, err := json.Marshal(accounts)
	if err != nil {
		log.Println("Error Marshilling : ", err)
	}
	w.Write(accountsJson)
}

func validateLogin(w http.ResponseWriter, e *http.Request) {
	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	loginStatus := LoginStatus{}
	loginStatus.IsLoggedIn = true

	out, err := exec.Command("bash", "-c", "az account show -o json").Output()

	if err != nil {
		loginStatus.IsLoggedIn = false
		log.Println("Validating Login - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	fmt.Println(string(out))

	loginStatusJson, err := json.Marshal(loginStatus)
	if err != nil {
		log.Println(err)
	}

	w.Write(loginStatusJson)
}
