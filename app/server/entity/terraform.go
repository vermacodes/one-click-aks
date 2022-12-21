package entity

import (
	"os"
	"os/exec"
)

type TerraformService interface {
	// Terraform Init
	Init() error

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

type TerraformRepository interface {
	TerraformAction(TfvarConfigType, string, string) (*exec.Cmd, *os.File, *os.File, error)
}
