package repository

import (
	"encoding/json"
	"encoding/xml"
	"io"
	"net/http"
	"os/exec"
	"strconv"
	"strings"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type assignmentRepository struct{}

func NewAssignmentRepository() entity.AssignmentRepository {
	return &assignmentRepository{}
}

// List of all the available assignments.
func (a *assignmentRepository) GetEnumerationResults() (entity.EnumerationResults, error) {
	er := entity.EnumerationResults{}

	// URL of the container to list the blobs
	url := "https://" + entity.StorageAccountName + ".blob.core.windows.net/repro-project-assignments" + entity.SasToken + "&restype=container&comp=list"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return er, err
	}

	req.Header.Add("Accept", "application/json")
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return er, err
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return er, err
	}

	if err := xml.Unmarshal(body, &er); err != nil {
		return er, err
	}

	return er, nil
}

func (a *assignmentRepository) GetAssignment(name string) (entity.Assigment, error) {
	assignment := entity.Assigment{}

	// URL of the blob with SAS token.
	url := "https://" + entity.StorageAccountName + ".blob.core.windows.net/repro-project-assignments/" + name + "" + entity.SasToken

	resp, err := http.Get(url)
	if err != nil {
		return assignment, err
	}

	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return assignment, err
	}

	if err := json.Unmarshal(bodyBytes, &assignment); err != nil {
		return assignment, err
	}

	return assignment, nil
}

func (a *assignmentRepository) DeleteAssignment(assignmentId string) error {
	_, err := exec.Command("bash", "-c", "az storage blob delete -c repro-project-assignments -n "+assignmentId+".json --account-name "+entity.StorageAccountName+" --sas-token '"+entity.SasToken+"'").Output()
	return err
}

func (a *assignmentRepository) CreateAssignment(assignmentId string, assignment string) error {
	slog.Info("Using SAS Token" + entity.SasToken)
	_, err := exec.Command("bash", "-c", "echo '"+assignment+"' | az storage blob upload --data @- -c repro-project-assignments -n "+assignmentId+".json --account-name "+entity.StorageAccountName+" --sas-token '"+entity.SasToken+"' --overwrite").Output()
	return err
}

func (a *assignmentRepository) ValidateUser(userId string) (bool, error) {
	out, err := exec.Command("bash", "-c", "az ad user show --id '"+userId+"' --query 'accountEnabled' --output json 2>/dev/null").Output()
	if err != nil {
		return false, err
	}

	outString := string(out)
	outStringTrimmed := strings.TrimRight(outString, "\n")
	//Convert to boolean.
	boolVal, err := strconv.ParseBool(outStringTrimmed)
	if err != nil {
		return false, err
	}

	return boolVal, nil
}
