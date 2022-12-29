package repository

import (
	"os/exec"

	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type prefenceRepository struct{}

func NewPreferenceRepository() entity.PreferenceRepository {
	return &prefenceRepository{}
}

func (p *prefenceRepository) GetPreferenceFromBlob(storageAccountName string) (string, error) {
	out, err := exec.Command("bash", "-c", "az storage blob download -c tfstate -n preference.json --account-name "+storageAccountName+" --file /tmp/preference > /dev/null 2>&1 && cat /tmp/preference && rm /tmp/preference").Output()
	return string(out), err
}

func (p *prefenceRepository) PutPreferenceInBlob(val string, storageAccountName string) error {
	_, err := exec.Command("bash", "-c", "echo '"+val+"' | az storage blob upload --data @- -c tfstate -n preference.json --account-name "+storageAccountName+" --overwrite").Output()
	return err
}

func (p *prefenceRepository) GetPreferenceFromRedis() (string, error) {
	return getRedis("preference")
}

func (p *prefenceRepository) PutPreferenceInRedis(val string) error {
	return setRedis("preference", val)
}
