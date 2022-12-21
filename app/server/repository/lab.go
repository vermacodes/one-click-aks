package repository

import (
	"encoding/json"
	"encoding/xml"
	"io"
	"net/http"
	"os/exec"

	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type labRepository struct{}

func NewLabRespository() entity.LabRepository {
	return &labRepository{}
}

func (l *labRepository) GetLabFromRedis() (string, error) {
	return getRedis("lab")
}

func (l *labRepository) SetLabInRedis(val string) error {
	return setRedis("lab", val)
}

func (l *labRepository) GetEnumerationResults(typeOfLab string) (entity.EnumerationResults, error) {
	er := entity.EnumerationResults{}

	url := "https://ashisverma.blob.core.windows.net/repro-project-" + typeOfLab + "?restype=container&comp=list"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return er, err
	}

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	err = xml.Unmarshal(body, &er)
	if err != nil {
		return er, err
	}

	return er, nil
}

func (l *labRepository) GetLab(url string) (entity.LabType, error) {
	lab := entity.LabType{}
	resp, err := http.Get(url)
	if err != nil {
		return lab, err
	}

	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	if err := json.Unmarshal(bodyBytes, &lab); err != nil {
		return lab, err
	}

	return lab, nil
}

func (l *labRepository) AddLab(labId string, lab string, typeOfLab string) error {
	_, err := exec.Command("bash", "-c", "echo '"+lab+"' | az storage blob upload --data @- -c repro-project-"+typeOfLab+"s -n "+labId+".json --account-name ashisverma  --overwrite").Output()
	return err
}

func (l *labRepository) DeleteLab(labId string, typeOfLab string) error {
	_, err := exec.Command("bash", "-c", "az storage blob delete -c repro-project-"+typeOfLab+"s -n "+labId+".json --account-name ashisverma").Output()
	return err
}

func (l *labRepository) GetMyLabsFromRedis() (string, error) {
	return getRedis("mylabs")
}

func (l *labRepository) GetMyLabsFromStorageAccount(storageAccountName string) (string, error) {
	out, err := exec.Command("bash", "-c", "az storage blob list -c labs --account-name "+storageAccountName+" --output json").Output()
	return string(out), err
}

func (l *labRepository) GetMyLabFromStorageAccount(storageAccountName string, blobName string) (string, error) {
	out, err := exec.Command("bash", "-c", "az storage blob download -c labs -n "+blobName+" --account-name "+storageAccountName+" --file /tmp/"+blobName+" > /dev/null 2>&1 && cat /tmp/"+blobName+" && rm /tmp/"+blobName).Output()
	return string(out), err
}

func (l *labRepository) AddMyLab(storageAccountName string, labId string, lab string) error {
	_, err := exec.Command("bash", "-c", "echo '"+lab+"' | az storage blob upload --data @- -c labs -n "+labId+".json --account-name "+storageAccountName+" --overwrite").Output()
	return err
}

func (l *labRepository) DeleteLabsFromRedis() error {
	return nil
}

func (l *labRepository) DeleteMyLab(labId string, storageAccountName string) error {
	_, err := exec.Command("bash", "-c", "az storage blob delete -c labs -n "+labId+".json --account-name "+storageAccountName).Output()
	return err
}
