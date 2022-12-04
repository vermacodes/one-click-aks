package main

import (
	"encoding/json"
	"encoding/xml"
	"errors"
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
	Id             string          `json:"id"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	Tags           []string        `json:"tags"`
	Template       TfvarConfigType `json:"template"`
	BreakScript    string          `json:"breakScript"`
	ValidateScript string          `json:"validateScript"`
	Message        string          `json:"message"`
	Type           string          `json:"type"`
	CreatedBy      string          `json:"createdBy"`
	CreatedOn      string          `json:"createdOn"`
	UpdatedBy      string          `json:"updatedBy"`
	UpdatedOn      string          `json:"updatedOn"`
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

	// Generate ID if doesnt exist.
	if lab.Id == "" {
		lab.Id = generate(20)
	}

	labJson, err := json.Marshal(lab)

	if err != nil {
		log.Println("Not able marshal blob to json", err)
		c.String(http.StatusInternalServerError, "Not able marshal blob to json")
		return
	}

	var out []byte
	if lab.Type == "template" {
		out, err = exec.Command("bash", "-c", "echo '"+string(labJson)+"' | az storage blob upload --data @- -c labs -n "+lab.Id+".json --account-name "+getStorageAccountName()+" --overwrite").Output()
	}
	if lab.Type == "lab" {
		out, err = exec.Command("bash", "-c", "echo '"+string(labJson)+"' | az storage blob upload --data @- -c repro-project-labs -n "+lab.Id+".json --account-name ashisverma  --overwrite").Output()
	}
	if lab.Type == "mockcase" {
		out, err = exec.Command("bash", "-c", "echo '"+string(labJson)+"' | az storage blob upload --data @- -c repro-project-mockcases -n "+lab.Id+".json --account-name ashisverma  --overwrite").Output()
	}
	if lab.Type == "sharedtemplate" {
		out, err = exec.Command("bash", "-c", "echo '"+string(labJson)+"' | az storage blob upload --data @- -c repro-project-sharedtemplates -n "+lab.Id+".json --account-name ashisverma  --overwrite").Output()
	}

	if err != nil {
		log.Println("Not able to save blob in createLab", err)
		c.String(http.StatusInternalServerError, "Error saving blob.")
		return
	}
	log.Println("Blob created: ", string(out))

	c.IndentedJSON(http.StatusCreated, lab)
}

func deleteLab(c *gin.Context) {

	var lab LabType
	if err := c.BindJSON(&lab); err != nil {
		return
	}
	var out []byte
	var err error
	if lab.Type == "template" {
		out, err = exec.Command("bash", "-c", "az storage blob delete -c labs -n "+lab.Id+".json --account-name "+getStorageAccountName()).Output()
	}
	if lab.Type == "sharedtemplate" {
		out, err = exec.Command("bash", "-c", "az storage blob delete -c repro-project-sharedtemplates -n "+lab.Id+".json --account-name ashisverma").Output()
	}
	if lab.Type == "lab" {
		out, err = exec.Command("bash", "-c", "az storage blob delete -c repro-project-labs -n "+lab.Id+".json --account-name ashisverma").Output()
	}
	if lab.Type == "mockcase" {
		out, err = exec.Command("bash", "-c", "az storage blob delete -c repro-project-mockcases -n "+lab.Id+".json --account-name ashisverma").Output()
	}

	if err != nil {
		log.Println("Not able to delete blob in deleteLab", err)
		c.String(http.StatusInternalServerError, "Error deleting blob.")
		return
	}
	log.Println("Blob deleted: ", string(out))

	c.Status(http.StatusNoContent)
}

func getLabs(c *gin.Context) {
	labType := c.Param("type")

	if labType == "mytemplates" {

		// Fetching templates is different from fetching labs or mock cases as these are comming from private container.
		// TODO: May be add them to redis to make it work faster.

		type Blob = struct {
			Name string `json:"name"`
		}

		blobs := []Blob{}

		out, err := exec.Command("bash", "-c", "az storage blob list -c labs --account-name "+getStorageAccountName()+" --output json").Output()
		if err != nil {
			log.Println("Not able to list the templates", err)
			c.Status(http.StatusInternalServerError)
			return
		}

		if err = json.Unmarshal(out, &blobs); err != nil {
			log.Println("Error getting templates from your storage account", err)
			c.Status(http.StatusInternalServerError)
			return
		}

		labs := []LabType{}
		for index, blob := range blobs {
			log.Println("Lab ", index, blob.Name)
			out, err = exec.Command("bash", "-c", "az storage blob download -c labs -n "+blob.Name+" --account-name "+getStorageAccountName()+" --file /tmp/file > /dev/null 2>&1 && cat /tmp/file && rm /tmp/file").Output()
			if err != nil {
				log.Println("Error getting preferences from storage exec command failed", err)
				continue
			}

			lab := LabType{}
			if err = json.Unmarshal(out, &lab); err != nil {
				log.Println("Error reading blob", err)
				continue
			}
			labs = append(labs, lab)
		}
		c.IndentedJSON(http.StatusOK, labs)
		return
	}

	if labType == "labs" || labType == "mockcases" || labType == "sharedtemplates" {
		getPublicLabs(c, labType)
		return
	}

	c.Status(http.StatusNotFound)
}

func getPublicLabs(c *gin.Context, labType string) {

	var labs EnumerationResults

	url := "https://ashisverma.blob.core.windows.net/repro-project-" + labType + "?restype=container&comp=list"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println("Not able to execute http request", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	err = xml.Unmarshal(body, &labs)
	if err != nil {
		log.Println("Error : ", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	_labs := []LabType{}

	for _, element := range labs.Blobs.Blob {
		resp, err := http.Get(element.Url)
		if err != nil {
			log.Println("Error : ", err)
			continue
		}

		defer resp.Body.Close()

		bodyBytes, _ := io.ReadAll(resp.Body)

		// Convert response body to Todo struct
		var lab LabType
		json.Unmarshal(bodyBytes, &lab)

		_labs = append(_labs, lab)
	}

	c.IndentedJSON(http.StatusOK, _labs)
}

func listLabs(labType string) ([]LabType, error) {

	var labs EnumerationResults
	_labs := []LabType{}

	url := "https://ashisverma.blob.core.windows.net/repro-project-" + labType + "s?restype=container&comp=list"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println("Not able to execute http request", err)
		return _labs, err
	}

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	err = xml.Unmarshal(body, &labs)
	if err != nil {
		log.Println("Error : ", err)
		return _labs, err
	}
	if err != nil {
		log.Println("Error : ", err)
		return _labs, err
	}

	for _, element := range labs.Blobs.Blob {
		resp, err := http.Get(element.Url)
		if err != nil {
			log.Println("Error : ", err)
			continue
		}

		defer resp.Body.Close()

		bodyBytes, _ := io.ReadAll(resp.Body)

		// Convert response body to Todo struct
		var lab LabType
		json.Unmarshal(bodyBytes, &lab)

		_labs = append(_labs, lab)
	}

	return _labs, nil
}

func getLabByIdAndType(labId string, labType string) (LabType, error) {
	lab := LabType{}

	labs, err := listLabs(labType)
	if err != nil {
		log.Println("Not able to list labs", err)
		return lab, nil
	}

	for _, element := range labs {
		if labId == element.Id {
			return element, nil
		}
	}
	return lab, errors.New("lab not found")
}

func listLabsApi(c *gin.Context) {

	priviledge, err := getPrivileges()
	if err != nil || !priviledge.IsAdmin || !priviledge.IsMentor {
		log.Println("Not priviledged", err)
		c.Status(http.StatusUnauthorized)
		return
	}

	var labs EnumerationResults

	url := "https://ashisverma.blob.core.windows.net/repro-project-labs?restype=container&comp=list"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println("Not able to execute http request", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	err = xml.Unmarshal(body, &labs)
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

	_labs := []LabType{}

	for _, element := range labs.Blobs.Blob {
		resp, err := http.Get(element.Url)
		if err != nil {
			log.Println("Error : ", err)
			continue
		}

		defer resp.Body.Close()

		bodyBytes, _ := io.ReadAll(resp.Body)

		// Convert response body to Todo struct
		var lab LabType
		json.Unmarshal(bodyBytes, &lab)

		_labs = append(_labs, lab)
	}

	c.IndentedJSON(http.StatusOK, _labs)
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

	tfConfig := lab.Template

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

	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/terraform.sh", "apply")

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

func labAction(c *gin.Context) {

	lab, err := getLabByIdAndType(c.Param("labId"), c.Param("labType"))
	if err != nil {
		log.Println("Not able to get the lab by its Id. Upstream error :", err)
		if _, err = http.Get("http://localhost:8080/endstream"); err != nil {
			log.Println("Not able to end stream")
		}
		updateActionStatus(false)
		c.Status(http.StatusNotFound)
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

	labAction := c.Param("labaction")
	var cmd *exec.Cmd
	if labAction == "break" {
		cmd = exec.Command("bash", "-c", "echo '"+lab.BreakScript+"' | base64 -d | bash")
	} else if labAction == "validate" {
		cmd = exec.Command("bash", "-c", "echo '"+lab.ValidateScript+"' | base64 -d | bash")
	} else {
		cmd = exec.Command("bash", "-c", "echo 'Invalid Lab Action'")
	}

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
	if _, err = http.Get("http://localhost:8080/endstream"); err != nil {
		log.Println("Not able to end stream")
	}
	updateActionStatus(false)
}
