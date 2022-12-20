package entity

import (
	"os"
	"os/exec"
)

type LabType struct {
	Id             string          `json:"id"`
	Name           string          `json:"name"`
	Description    string          `json:"description"`
	Tags           []string        `json:"tags"`
	Template       TfvarConfigType `json:"template"`
	ExtendScript   string          `json:"extendScript"`
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

type LabService interface {
	GetLabFromRedis() (LabType, error)
	SetLabInRedis(LabType) error
	// Streams logs
	Plan(LabType) error

	// Apply terraform and then run extend script if any
	// This streams logs.
	Apply(LabType) error

	// destroy the resources in current worksapce.
	// Streams logs
	Destroy(LabType) error

	// Executes shell script to run vlidation aginst infra.
	// runs against selected workspace. This doesnt send any response body
	// and logs are streamed.
	Validate() error
}

type LabRepository interface {
	GetLabFromRedis() (string, error)
	SetLabInRedis(string) error
	TerraformAction(TfvarConfigType, string, string) (*exec.Cmd, *os.File, *os.File, error)
}
