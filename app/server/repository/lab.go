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

func (l *labRepository) DeleteLabFromRedis() error {
	return deleteRedis("lab")
}

func (l *labRepository) GetExtendScriptTemplate() (string, error) {
	//return "IyEvdXNyL2Jpbi9lbnYgYmFzaA0KDQojIEV4dGVuc2lvbiBTY3JpcHQuIA0KIyANCiMgQWxsIHRoYXQgaXMgbmVlZGVkIGlzIHRvIG1vZGlmeSBlaXRoZXIgdmFsaWRhdGUoKSwgZXh0ZW5kKCkgb3IgZGVzdHJveSgpIGZ1bmN0aW9ucyBpbiB0aGlzIHNjcmlwdC4NCiMgVG8gYXBwbHkgWUFNTHMgeW91IGNhbiBjcmF0ZSBmdW5jdGlvbnMgYW5kIHVzZSBmb3JtYWwgbGlrZSB0aGlzLiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTQzNjQwNjMvMjM1MzQ2MA0KIw0KIw0KIw0KIyBUaGlzIHNjcmlwdCBoYXMgYWNjZXNzIHRvIGFsbCB0aGUgdGVycmFmb3JtIG91dHB1dCB2YXJpYWJsZXMgaW4gYWxsIENBUFMuDQojIFNvbWUgb2YgdGhvc2UgYXJlIGFzIGZvbGxvd3MuDQojDQojDQojDQojIDAxLiAgIEF6dXJlIENvbnRhaW5lciBSZWdpdHJ5IE5hbWUNCiMgICAgICAgICAgIE5hbWUgOiBBQ1JfTkFNRQ0KIyAgICAgICAgICAgVHlwZSA6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzIDogIiIgfCAibmFtZSBvZiB0aGUgYWNyIg0KIyAwMi4gICBBS1MgUHVsbCBDcmVkZW50aWFscyBDb21tYW5kDQojICAgICAgICAgICBOYW1lOiBBS1NfTE9HSU4NCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiYXogYWtzIGdldC1jcmVuZGVudGFpbHMgY29tbWFuZCINCiMgMDMuICAgQUtTIENsdXN0ZXIgTmFtZQ0KIyAgICAgICAgICAgTmFtZTogQ0xVU1RFUl9OQU1FDQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogImNsdXN0ZXItbmFtZSINCiMgMDQuICAgQUtTIENsdXN0ZXIgVmVyc2lvbg0KIyAgICAgICAgICAgTmFtZTogQ0xVU1RFUl9WRVJTSU9ODQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogIjEuMjMuMTIiDQojIDA1LiAgIEZpcmV3YWxsIFByaXZhdGUgSVANCiMgICAgICAgICAgIE5hbWU6IEZJUkVXQUxMX1BSSVZBVEVfSVANCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiIiB8ICIwLjAuMC4wIg0KIyAwNi4gICBOZXR3b3JrIFNlY3VyaXR5IEdyb3VwIE5hbWUNCiMgICAgICAgICAgIE5hbWU6IE5TR19OQU1FDQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogIiIgfCAibnNnX25hbWUiDQojIDA3LiAgIExvY2F0aW9uIHwgQXp1cmUgUmVnaW9uDQojICAgICAgICAgICBOYW1lOiBMT0NBVElPTg0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICJyZWdpb24iDQojIDA4LiAgIFJlc291cmNlIEdyb3VwIE5hbWUNCiMgICAgICAgICAgIE5hbWU6IFJFU09VUkNFX0dST1VQDQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogInJlc291cmNlX2dyb3VwX25hbWUiDQojIDA5LiAgIFZpcnR1YWwgTmV0d29yayBOYW1lDQojICAgICAgICAgICBOYW1lOiBWTkVUX05BTUUNCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiIiB8ICJ2bmV0X25hbWUiDQojIDEwLiAgIENsdXN0ZXIgTWFuYWdlZCBTZXJ2aWNlIElkZW50aXR5IElEDQojICAgICAgICAgICBOYW1lOiBDTFVTVEVSX01TSV9JRA0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICIiIHwgImNsdXN0ZXJfbXNpX2lkIg0KIyAxMS4gICBLdWJlbGV0IE1hbmFnZWQgU2VydmljZSBJZGVudGl0eSBJRA0KIyAgICAgICAgICAgTmFtZTogS1VCRUxFVF9NU0lfSUQNCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiIiB8ICJrdWJlbGV0X21zaV9pZCINCiMNCiMNCiMNCiMgU2hhcmVkIGZ1bmN0aW9ucyB0aGF0IHRoaXMgc2NyaXB0IGhhcyBhY2Nlc3MgdG8uDQojDQojDQojIDAxLiAgIExvZ2luZw0KIyAgICAgICBsb2coKQ0KIyAgICAgICBBcmdzOiAic3RyaW5nIg0KIyAgICAgICBFeGFtcGxlOiBsb2cgInRoaXMgc3RhdGVtZW50IHdpbGwgYmUgbG9nZ2VkIg0KIw0KIyAwMy4gICBHcmVlbiAoT0spIExvZ2dpbmcNCiMgICAgICAgb2soKQ0KIyAgICAgICBBcmdzOiAic3RyaW5nIg0KIyAgICAgICBFeGFtcGxlOiBvayAidGhpcyBzdGF0ZW1lbnQgd2lsbCBiZSBsb2dnZWQgYXMgSU5GTyBsb2cgaW4gZ3JlZW4gY29sb3IiDQojDQojIDAzLiAgIEVycm9yIExvZ2dpbmcNCiMgICAgICAgZXJyKCkNCiMgICAgICAgQXJnczogKFN0cmluZykNCiMgICAgICAgRXhhbXBsZTogZXJyICJ0aGlzIGVycm9yIG9jY3J1cmVkIg0KIw0KDQojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjDQojICAgRE8gTk9UIE1PRElGWSBBQk9WRSBUSElTIExJTkUgICAjDQojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjDQoNCmZ1bmN0aW9uIHZhbGlkYXRlKCkgew0KICAgICMgQWRkIHlvdXIgY29kZSBoZXJlIGZvciB2YWxpZGF0aW9uDQogICAgb2sgIm5vdGhpbmcgdG8gdmFsaWRhdGUiDQp9DQoNCmZ1bmN0aW9uIGRlc3Ryb3koKSB7DQogICAgIyBBZGQgeW91ciBjb2RlIGhlcmUgdG8gYmUgZXhlY3V0ZWQgYmVmb3JlIGRlc3RydWN0aW9uDQogICAgb2sgIm5vdGhpbmcgdG8gZGVzdHJveSINCn0NCg0KZnVuY3Rpb24gZXh0ZW5kKCkgew0KICAgICMgQWRkIHlvdXIgY29kZSBoZXJlIHRvIGJlIGV4ZWN1dGVkIGFmdGVyIGFwcGx5DQogICAgb2sgIm5vdGhpbmcgdG8gZXh0ZW5kIg0KfQ0KDQojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjDQojICAgRE8gTk9UIE1PRElGWSBCRUxPVyBUSElTIExJTkUgICAjDQojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjDQoNCiMjDQojIyBTY3JpcHQgc3RhcnRzIGhlcmUuDQojIw0KDQojSW5pdGlhbGl6ZSB0aGUgZW52aXJvbm1lbnQuDQpzb3VyY2UgJFJPT1RfRElSL3NjcmlwdHMvaGVscGVyLnNoICYmIGluaXQNCg0Kb2sgImJlZ2luaW5nIG9mIGV4dGVuc2lvbiBzY3JpcHQiDQoNCiMgY2FsbHMgdGhlIG1ldGhvZCB5b3UgYWRkZWQgdGhlIGNvZGUgdG8uDQppZiBbWyAke1NDUklQVF9NT0RFfSA9PSAiYXBwbHkiIF1dOyB0aGVuDQogICAgZXh0ZW5kDQplbGlmIFtbICR7U0NSSVBUX01PREV9ID09ICJkZXN0cm95IiBdXTsgdGhlbg0KICAgIGRlc3Ryb3kNCmVsaWYgW1sgJHtTQ1JJUFRfTU9ERX0gPT0gInZhbGlkYXRlIiBdXTsgdGhlbg0KICAgIHZhbGlkYXRlDQpmaQ0KDQpvayAiZW5kIG9mIGV4dGVuc2lvbiBzY3JpcHQi", nil
	out, err := exec.Command("bash", "-c", "cat ${ROOT_DIR}/scripts/template.sh | base64").Output()
	return string(out), err
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
	_, err := exec.Command("bash", "-c", "echo '"+lab+"' | az storage blob upload --data @- -c repro-project-"+typeOfLab+"s -n "+labId+".json --account-name ashisverma --sas-token '"+entity.SasToken+"' --overwrite").Output()
	return err
}

func (l *labRepository) DeleteLab(labId string, typeOfLab string) error {
	_, err := exec.Command("bash", "-c", "az storage blob delete -c repro-project-"+typeOfLab+"s -n "+labId+".json --account-name ashisverma --sas-token '"+entity.SasToken+"'").Output()
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
