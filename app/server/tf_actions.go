package main

import (
	"bufio"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/Rican7/conjson"
	"github.com/Rican7/conjson/transform"
	"github.com/gin-gonic/gin"
)

type TfvarResourceGroupType struct {
	Location string `json:"location"`
}

type TfvarDefaultNodePoolType struct {
	EnableAutoScaling bool `json:"enableAutoScaling"`
	MinCount          int  `json:"minCount"`
	MaxCount          int  `json:"maxCount"`
}

type TfvarKubernetesClusterType struct {
	NetworkPlugin         string                   `json:"networkPlugin"`
	NetworkPolicy         string                   `json:"networkPolicy"`
	PrivateClusterEnabled string                   `json:"privateClusterEnabled"`
	DefaultNodePool       TfvarDefaultNodePoolType `json:"defaultNodePool"`
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

type LogStreamType struct {
	IsStreaming bool   `json:"isStreaming"`
	Logs        string `json:"logs"`
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

func endLogsStream() {
	log.Println("Ending Stream in 5 seconds")
	time.Sleep(5 * time.Second)
	for {
		currLogsStream := readLogsRedis()
		currLogs, err := base64.StdEncoding.DecodeString(currLogsStream.Logs)
		if err != nil {
			log.Println("Error in appendLogRedis")
			return
		}
		newLogsStream := LogStreamType{
			IsStreaming: false,
			Logs:        base64.StdEncoding.EncodeToString([]byte(string(currLogs))),
		}

		writeLogsRedis(&newLogsStream)

		if !readLogsRedis().IsStreaming {
			break
		}
		log.Println("Stream not ended. Will try again in 1 second")
		time.Sleep(1 * time.Second)
	}
}

func appendLogsRedis(logs string) {
	currLogsStream := readLogsRedis()
	currLogs, err := base64.StdEncoding.DecodeString(currLogsStream.Logs)
	if err != nil {
		log.Println("Error in appendLogRedis")
		return
	}
	newLogsStream := LogStreamType{
		IsStreaming: currLogsStream.IsStreaming,
		Logs:        base64.StdEncoding.EncodeToString([]byte(string(currLogs) + logs)),
	}

	writeLogsRedis(&newLogsStream)
}

func writeLogsRedis(logs *LogStreamType) {
	rdb := newRedisClient()
	json, err := json.Marshal(logs)
	if err != nil {
		log.Println("Error Marshal in writeLogsRedis")
	}
	rdb.Set(ctx, "Logs", json, 0)
}

func readLogsRedis() LogStreamType {
	rdb := newRedisClient()
	logs := LogStreamType{}
	val, err := rdb.Get(ctx, "Logs").Result()
	if err != nil {
		log.Println("Error : ", err)
		return logs
	}
	if err = json.Unmarshal([]byte(val), &logs); err != nil {
		log.Println("Error unmarshal logs in readLogsRedis")
	}
	return logs
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

	// Kubernetes Cluster
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

	updateActionStatus(true)
	if err := cmd.Start(); err != nil {
		log.Fatal(err)
	}

	go writeOutput(w, rPipe)
	cmd.Wait()
	wPipe.Close()
	updateActionStatus(false)
	appendLogsRedis(fmt.Sprintf("%s\n", "end"))
	if _, err = http.Get("http://localhost:8080/endstream"); err != nil {
		log.Println("Not able to end stream")
	}
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

	// flusher, ok := w.(http.Flusher)
	// if !ok {
	// 	http.Error(w, "Streaming not supported", http.StatusInternalServerError)
	// 	return
	// }

	in := bufio.NewScanner(input)
	for in.Scan() {
		//fmt.Fprintf(w, "%s\n", in.Text())
		appendLogsRedis(fmt.Sprintf("%s\n", in.Text()))
		//fmt.Println(in.Text())
		//flusher.Flush()
	}
	input.Close()
}
