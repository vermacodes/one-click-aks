package main

import (
	"encoding/json"
	"encoding/xml"
	"io"
	"log"
	"net/http"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

type Assigment struct {
	Id      string `json:"id"`
	User    string `json:"user"`
	LabId   string `json:"labId"`
	LabName string `json:"labName"`
	Status  string `json:"status"`
}

func listAssignments() ([]Assigment, error) {
	var blobs EnumerationResults
	assignments := []Assigment{}

	req, err := http.NewRequest("GET", "https://ashisverma.blob.core.windows.net/repro-project-assignments?restype=container&comp=list", nil)
	if err != nil {
		log.Println("Not able form request to pull blobs from upstream", err)
		return assignments, err
	}

	req.Header.Add("Accept", "application/json")
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println("Not able to pull blobs from upstream", err)
		return assignments, err
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		log.Println("Not able to read response body for blob list", err)
		return assignments, err
	}

	if err := xml.Unmarshal(body, &blobs); err != nil {
		log.Println("Error to read response body", err)
		return assignments, err
	}

	for _, element := range blobs.Blobs.Blob {
		resp, err := http.Get(element.Url)
		if err != nil {
			log.Println("Not able to pull ", element.Name)
			continue
		}
		defer resp.Body.Close()
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Println("Not able to read response body for assignment", element.Name)
			continue
		}
		var assignment Assigment
		json.Unmarshal(bodyBytes, &assignment)
		assignments = append(assignments, assignment)
	}
	return assignments, nil
}

func listAssignmentsApi(c *gin.Context) {
	priviledge, err := getPrivileges()
	if err != nil || !priviledge.IsAdmin || !priviledge.IsMentor {
		log.Println("Not priviledged", err)
		c.Status(http.StatusUnauthorized)
		return
	}

	assignments, err := listAssignments()
	if err != nil {
		log.Println("Not able to list assignments", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, assignments)
}

// func listUserAssignments(c *gin.Context) {

// }

// Input : query param 'user'
// Returns : Labs assigned to the user. scripts are REDACTED.
func listUserAssignedLabsApi(c *gin.Context) {
	account, err := accountShow()
	if err != nil {
		log.Println("Not able to get current account", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	assignments, err := listAssignments()
	if err != nil {
		log.Println("Not able to list assignments", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	labs, err := listLabs("lab")
	if err != nil {
		log.Println("Not able to list labs", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	userAssignedLabs := []LabType{}

	for _, assignment := range assignments {
		log.Println("Assignment ID : ", assignment.Id)
		for _, lab := range labs {
			log.Println("Lab ID : ", lab.Name)
			if assignment.LabId == lab.Id {
				if assignment.User == account.User.Name {
					//Values redacted.
					lab.BreakScript = ""
					lab.ValidateScript = ""
					userAssignedLabs = append(userAssignedLabs, lab)
					break
				}
			}
		}
	}
	c.IndentedJSON(http.StatusOK, userAssignedLabs)
}

func createAssignment(assignment Assigment) error {

	// TODO: Access control

	if assignment.Id == "" {
		assignment.Id = generate(20)
	}

	if !strings.Contains("@microsoft.com", assignment.User) {
		assignment.User = assignment.User + "@microsoft.com"
	}

	// Check if assignment already exists.
	assignments, err := listAssignments()
	if err != nil {
		log.Println("Unable to list assignments", err)
		return err
	}

	for _, element := range assignments {
		if element.User == assignment.User && element.LabId == assignment.LabId {
			log.Println("Assignment already exists")
			return nil
		}
	}

	assignmentBytes, err := json.Marshal(&assignment)
	if err != nil {
		log.Println("Unable to marshal assignment object to string", err)
		return err
	}

	if _, err := exec.Command("bash", "-c", "echo '"+string(assignmentBytes)+"' | az storage blob upload --data @- -c repro-project-assignments -n "+assignment.Id+".json --account-name ashisverma  --overwrite").Output(); err != nil {
		log.Println("Unable to create assignmet in backend", err)
		return err
	}

	return nil
}

func createAssignmentApi(c *gin.Context) {

	priviledge, err := getPrivileges()
	if err != nil || !priviledge.IsAdmin || !priviledge.IsMentor {
		log.Println("Not priviledged", err)
		c.Status(http.StatusUnauthorized)
		return
	}

	assignment := Assigment{}
	if err := c.Bind(&assignment); err != nil {
		log.Println("Failed to bind assignmet body to object.", err)
		c.Status(http.StatusBadRequest)
		return
	}

	if assignment.User == "" {
		c.Status(http.StatusBadRequest)
		return
	}

	if err := createAssignment(assignment); err != nil {
		log.Println("Unable to create assignment", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusCreated)
}

func deleteAssignment(c *gin.Context) {
	priviledge, err := getPrivileges()
	if err != nil || !priviledge.IsAdmin || !priviledge.IsMentor {
		log.Println("Not priviledged", err)
		c.Status(http.StatusUnauthorized)
		return
	}
	assignmentId := c.Param("assignmentId")
	if _, err := exec.Command("bash", "-c", "az storage blob delete -c repro-project-assignments -n "+assignmentId+".json --account-name ashisverma").Output(); err != nil {
		log.Println("Not able to delete assingment", assignmentId, err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.Status(http.StatusNoContent)
}
