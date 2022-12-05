package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/Rican7/conjson"
	"github.com/Rican7/conjson/transform"
	"github.com/gin-gonic/gin"
)

type ActionStatus struct {
	InProgress bool `json:"inProgress"`
}

func getActionStatus(c *gin.Context) {
	rdb := newRedisClient()

	val, err := rdb.Get(ctx, "ActionStatus").Result()
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}

	action := ActionStatus{}
	if err = json.Unmarshal([]byte(val), &action); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, action)
}

func setActionStatus(c *gin.Context) {
	rdb := newRedisClient()
	action := ActionStatus{}

	if err := c.BindJSON(&action); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	json, err := json.Marshal(action)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	rdb.Set(ctx, "ActionStatus", json, 0)
	c.Status(http.StatusCreated)
}

func updateActionStatus(status bool) {
	rdb := newRedisClient()
	action := ActionStatus{
		InProgress: status,
	}

	json, err := json.Marshal(action)
	if err != nil {
		log.Println("Update Action Status Failed", err)
		return
	}

	rdb.Set(ctx, "ActionStatus", json, 0)
}

func action(c *gin.Context, action string) {

	var tfConfig TfvarConfigType
	if err := c.BindJSON(&tfConfig); err != nil {
		return
	}

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

	// Resource Group
	encoded, _ := json.Marshal(conjson.NewMarshaler(tfConfig.ResourceGroup, transform.ConventionalKeys()))
	setEnvironmentVariable("TF_VAR_resource_group", string(encoded))

	// Virtual Network
	encoded, _ = json.Marshal(conjson.NewMarshaler(tfConfig.VirtualNetworks, transform.ConventionalKeys()))
	setEnvironmentVariable("TF_VAR_virtual_networks", string(encoded))

	// Subnets
	encoded, _ = json.Marshal(conjson.NewMarshaler(tfConfig.Subnets, transform.ConventionalKeys()))
	setEnvironmentVariable("TF_VAR_subnets", string(encoded))

	// Jumpserver
	encoded, _ = json.Marshal(conjson.NewMarshaler(tfConfig.Jumpservers, transform.ConventionalKeys()))
	setEnvironmentVariable("TF_VAR_jumpservers", string(encoded))

	// Kubernetes Cluster
	encoded, _ = json.Marshal(conjson.NewMarshaler(tfConfig.KubernetesCluster, transform.ConventionalKeys()))
	setEnvironmentVariable("TF_VAR_kubernetes_cluster", string(encoded))

	// Firewall
	encoded, _ = json.Marshal(conjson.NewMarshaler(tfConfig.Firewalls, transform.ConventionalKeys()))
	setEnvironmentVariable("TF_VAR_firewalls", string(encoded))

	// Continer Registry
	encoded, _ = json.Marshal(conjson.NewMarshaler(tfConfig.ContainerRegistries, transform.ConventionalKeys()))
	setEnvironmentVariable("TF_VAR_container_registries", string(encoded))

	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/terraform.sh", action)

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

func apply(c *gin.Context) {
	action(c, "apply")
}

func plan(c *gin.Context) {
	action(c, "plan")
}

func destroy(c *gin.Context) {
	action(c, "destroy")
}

func validateLab(c *gin.Context) {
	action(c, "validate")
}

func writeOutput(w gin.ResponseWriter, input io.ReadCloser) {
	in := bufio.NewScanner(input)
	for in.Scan() {
		appendLogsRedis(fmt.Sprintf("%s\n", in.Text()))
	}
	input.Close()
}
