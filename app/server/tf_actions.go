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

type TfvarResourceGroupType struct {
	Location string `json:"location"`
}

type TfvarKubernetesClusterType struct {
	NetworkPlugin         string `json:"networkPlugin"`
	NetworkPolicy         string `json:"networkPolicy"`
	PrivateClusterEnabled string `json:"privateClusterEnabled"`
}

type TfvarVirtualNeworkType struct {
	AddressSpace []string
}

type TfvarSubnetType struct {
	Name            string
	AddressPrefixes []string
}

type TfvarJumpserverType struct {
	AdminPassword string `json:"adminPassword"`
	AdminUserName string `json:"adminUsername"`
}

type TfvarConfigType struct {
	ResourceGroup     TfvarResourceGroupType     `json:"resourceGroup"`
	VirtualNetworks   []TfvarVirtualNeworkType   `json:"virtualNetworks"`
	Subnets           []TfvarSubnetType          `json:"subnets"`
	Jumpservers       []TfvarJumpserverType      `json:"jumpservers"`
	KubernetesCluster TfvarKubernetesClusterType `json:"kubernetesCluster"`
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

	//Kubernetes Cluster
	encoded, _ = json.Marshal(conjson.NewMarshaler(tfConfig.KubernetesCluster, transform.ConventionalKeys()))
	setEnvironmentVariable("TF_VAR_kubernetes_cluster", string(encoded))

	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/"+action+".sh", "tf",
		os.ExpandEnv("$ROOT_DIR"),
		os.ExpandEnv("$resource_group_name"),
		os.ExpandEnv("$storage_account_name"),
		os.ExpandEnv("$container_name"),
		os.ExpandEnv("$tf_state_file_name"))

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

func apply(c *gin.Context) {
	action(c, "apply")
}

func plan(c *gin.Context) {
	action(c, "plan")
}

func destroy(c *gin.Context) {
	action(c, "destroy")
}

func writeOutput(w gin.ResponseWriter, input io.ReadCloser) {

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming not supported", http.StatusInternalServerError)
		return
	}

	in := bufio.NewScanner(input)
	for in.Scan() {
		fmt.Fprintf(w, "%s\n", in.Text())
		fmt.Println(in.Text())
		flusher.Flush()
	}
	input.Close()
}
