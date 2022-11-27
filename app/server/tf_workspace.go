package main

import (
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

type Workspace struct {
	Name     string `json:"name"`
	Selected bool   `json:"selected"`
}

func tfInit(c *gin.Context) {

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	setEnvironmentVariable("terraform_directory", "tf")
	setEnvironmentVariable("root_directory", os.ExpandEnv("$ROOT_DIR"))
	setEnvironmentVariable("resource_group_name", "repro-project")
	setEnvironmentVariable("storage_account_name", getStorageAccountName())
	setEnvironmentVariable("container_name", "tfstate")
	setEnvironmentVariable("tf_state_file_name", "terraform.tfstate")

	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/terraform.sh", "init")

	rPipe, wPipe, err := os.Pipe()
	if err != nil {
		log.Fatal(err)
	}
	cmd.Stdout = wPipe
	cmd.Stderr = wPipe

	updateActionStatus(true)
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

func listWorkspaces(c *gin.Context) {
	var workspaces []Workspace
	//tfInit()
	setEnvironmentVariable("terraform_directory", "tf")
	setEnvironmentVariable("root_directory", os.ExpandEnv("$ROOT_DIR"))
	setEnvironmentVariable("resource_group_name", "repro-project")
	setEnvironmentVariable("storage_account_name", getStorageAccountName())
	setEnvironmentVariable("container_name", "tfstate")
	setEnvironmentVariable("tf_state_file_name", "terraform.tfstate")

	out, err := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/workspaces.sh", "list").Output()
	if err != nil {
		log.Println("Not able to get account list : ", err)
	}

	log.Println("Output => ", string(out))
	sliceOut := strings.Split(string(out), ",")
	for _, v := range sliceOut {

		var workspace = new(Workspace)
		workspace.Selected = false

		// Check for selected workspace and remove leading [* ] or remove the leading space
		if strings.HasPrefix(v, "*") {
			workspace.Selected = true
			v = strings.Split(v, "* ")[1]
		} else {
			// Removes the leading whitespace.
			v = strings.Split(v, " ")[1]
		}

		// Add workspace name.
		workspace.Name = v

		// Append workspace.
		workspaces = append(workspaces, *workspace)
	}
	c.IndentedJSON(http.StatusOK, workspaces)
}

func selectWorkspace(c *gin.Context) {
	var workspace Workspace

	if err := c.BindJSON(&workspace); err != nil {
		return
	}

	_, err := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/workspaces.sh", "select", workspace.Name).Output()
	if err != nil {
		log.Println("Not able select workspace : ", err)
	}
	c.Status(http.StatusCreated)
}

func deleteWorkspace(c *gin.Context) {
	var workspace Workspace

	if err := c.BindJSON(&workspace); err != nil {
		return
	}

	_, err := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/workspaces.sh", "delete", workspace.Name).Output()
	if err != nil {
		log.Println("Not able select workspace : ", err)
	}
	c.Status(http.StatusNoContent)
}

func addWorkspace(c *gin.Context) {
	var workspace Workspace

	if err := c.BindJSON(&workspace); err != nil {
		return
	}

	_, err := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/workspaces.sh", "new", workspace.Name).Output()
	if err != nil {
		log.Println("Not able select workspace : ", err)
	}
	c.Status(http.StatusCreated)
}
