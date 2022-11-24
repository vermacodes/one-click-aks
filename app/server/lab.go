package main

import (
	"encoding/json"
	"encoding/xml"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/Rican7/conjson"
	"github.com/Rican7/conjson/transform"
	"github.com/gin-gonic/gin"
)

type LabType struct {
	Name           string          `json:"name"`
	Tfvar          TfvarConfigType `json:"tfvar"`
	BreakScript    string          `json:"breakScript"`
	ValidateScript string          `json:"validateScript"`
}

type BlobType struct {
	Name string `json:"name"`
	Url  string `json:"url"`
}

func createLab(c *gin.Context) {

	var lab LabType
	if err := c.BindJSON(&lab); err != nil {
		return
	}

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	out, err := json.Marshal(lab)

	if err != nil {
		log.Println("Error marshaling json")
	}

	cmd := exec.Command("bash", "-c", "echo '"+string(out)+"' | az storage blob upload --data @- -c repro-project-labs -n "+lab.Name+" --account-name ashisverma")

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
	if _, err = http.Get("http://localhost:8080/endstream"); err != nil {
		log.Println("Not able to end stream")
	}
}

func listLabs(c *gin.Context) {

	var labs EnumerationResults

	url := "https://ashisverma.blob.core.windows.net/repro-project-labs?restype=container&comp=list"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Accept", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	err := xml.Unmarshal(body, &labs)
	if err != nil {
		log.Println("Error : ", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	if err != nil {
		log.Println("Error : ", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, labs.Blobs)
}

func deployLab(c *gin.Context) {

	var blob BlobType
	if err := c.BindJSON(&blob); err != nil {
		return
	}

	resp, err := http.Get(blob.Url)
	if err != nil {
		return
	}

	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	// Convert response body to Todo struct
	var lab LabType
	json.Unmarshal(bodyBytes, &lab)

	tfConfig := lab.Tfvar

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

	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/apply.sh", "tf",
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
	if _, err = http.Get("http://localhost:8080/endstream"); err != nil {
		log.Println("Not able to end stream")
	}
}

func breakLab(c *gin.Context) {

	var blob BlobType
	if err := c.BindJSON(&blob); err != nil {
		return
	}

	resp, err := http.Get(blob.Url)
	if err != nil {
		return
	}

	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	// Convert response body to Todo struct
	var lab LabType
	json.Unmarshal(bodyBytes, &lab)

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

	cmd := exec.Command("bash", "-c", "echo '"+lab.BreakScript+"' | base64 -d | bash")

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
	if _, err = http.Get("http://localhost:8080/endstream"); err != nil {
		log.Println("Not able to end stream")
	}
}

func validate(c *gin.Context) {

	var blob BlobType
	if err := c.BindJSON(&blob); err != nil {
		return
	}

	resp, err := http.Get(blob.Url)
	if err != nil {
		return
	}

	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	// Convert response body to Todo struct
	var lab LabType
	json.Unmarshal(bodyBytes, &lab)

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	cmd := exec.Command("bash", "-c", "echo '"+lab.ValidateScript+"' | base64 -d | bash")

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
	if _, err = http.Get("http://localhost:8080/endstream"); err != nil {
		log.Println("Not able to end stream")
	}
}
