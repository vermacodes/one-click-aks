package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/gin-gonic/gin"
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

func accountLogin(c *gin.Context) {

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

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
	if _, err = http.Get("http://localhost:8080/endstream"); err != nil {
		log.Println("Not able to end stream")
	}
	updateActionStatus(false)
}

func accountShow(c *gin.Context) {
	var account Account

	out, err := exec.Command("bash", "-c", "az account show -o json").Output()
	if err != nil {
		log.Println("Not able to get account list : ", err)
	}

	err = json.Unmarshal(out, &account)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	c.IndentedJSON(http.StatusOK, account)
}

func getAccounts(c *gin.Context) {
	var accounts []Account

	out, err := exec.Command("bash", "-c", "az account list -o json").Output()
	if err != nil {
		log.Println("Not able to get account list : ", err)
	}

	err = json.Unmarshal(out, &accounts)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	c.IndentedJSON(http.StatusOK, accounts)
}

func putAccount(c *gin.Context) {
	var account Account

	if err := c.BindJSON(&account); err != nil {
		log.Println("Not able to bind payload to Account in putAccount ", err)
		c.Status(http.StatusInternalServerError)
	}

	_, err := exec.Command("bash", "-c", "az account set --subscription "+account.Id).Output()
	if err != nil {
		log.Println("Not able to get account list : ", err)
	}

	var accounts []Account

	out, err := exec.Command("bash", "-c", "az account list -o json").Output()
	if err != nil {
		log.Println("Not able to get account list : ", err)
	}

	err = json.Unmarshal(out, &accounts)
	if err != nil {
		log.Println("Error Unmarshelling : ", err)
	}

	c.IndentedJSON(http.StatusOK, accounts)
}

func validateLogin(c *gin.Context) {

	loginStatus := LoginStatus{}
	loginStatus.IsLoggedIn = true

	_, err := exec.Command("bash", "-c", "az account show -o json").Output()

	if err != nil {
		loginStatus.IsLoggedIn = false
		log.Println("Validating Login - Not able to run az cli command")
		log.Println("Error output from comamnd : ", err)
	}

	c.IndentedJSON(http.StatusOK, loginStatus)
}
