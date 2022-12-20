package repository

import (
	"encoding/json"
	"os"
	"os/exec"
	"reflect"

	"github.com/Rican7/conjson"
	"github.com/Rican7/conjson/transform"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
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

func (l *labRepository) TerraformAction(tfvar entity.TfvarConfigType, action string, storageAccountName string) (*exec.Cmd, *os.File, *os.File, error) {

	setEnvironmentVariable("terraform_directory", "tf")
	setEnvironmentVariable("root_directory", os.ExpandEnv("$ROOT_DIR"))
	setEnvironmentVariable("resource_group_name", "repro-project")
	setEnvironmentVariable("storage_account_name", storageAccountName)
	setEnvironmentVariable("container_name", "tfstate")
	setEnvironmentVariable("tf_state_file_name", "terraform.tfstate")

	// Sets terrform environment variables from tfvar

	t := reflect.TypeOf(tfvar)
	// Loop over the fields in the struct.
	for i := 0; i < t.NumField(); i++ {
		// Get the field and its value at the current index.
		field := reflect.TypeOf(tfvar).Field(i)
		value := reflect.ValueOf(tfvar).Field(i)

		// Set the evironment variable of resource.
		encoded, _ := json.Marshal(conjson.NewMarshaler(value.Interface(), transform.ConventionalKeys()))
		setEnvironmentVariable("TF_VAR_"+helper.CamelToConventional(field.Name), string(encoded))
	}

	// Execute terraform script with appropriate action.
	cmd := exec.Command(os.ExpandEnv("$ROOT_DIR")+"/scripts/terraform.sh", action)
	rPipe, wPipe, err := os.Pipe()
	if err != nil {
		return cmd, rPipe, wPipe, err
	}
	cmd.Stdout = wPipe
	cmd.Stderr = wPipe
	if err := cmd.Start(); err != nil {
		return cmd, rPipe, wPipe, err
	}

	// Return stuff to the service.
	return cmd, rPipe, wPipe, nil
}
