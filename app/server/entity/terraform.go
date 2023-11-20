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

	// Apply terraform and then run extend script if any
	// This is async and doesn't stream logs.
	// ApplyAsync(LabType) (TerraformOperation, error)

	// Executes shell script to run extension of infra.
	// runs against selected workspace. This doesn't send any response body
	// and logs are streamed.
	Extend(LabType, string) error

	// Executes shell script to run extension of infra.
	// runs against selected workspace. This is async and doesn't stream logs.
	// ExtendAsync(LabType, string) (TerraformOperation, error)

	// destroy the resources in current workspace.
	// Streams logs
	Destroy(LabType) error

	// destroy the resources in current workspace.
	// This is async and doesn't stream logs.
	// DestroyAsync(LabType) (TerraformOperation, error)

	// Executes shell script to run validation against infra.
	// runs against selected workspace. This doesn't send any response body
	// and logs are streamed.
	// Validate(LabType) error
}

type TerraformRepository interface {
	TerraformAction(TfvarConfigType, string, string) (*exec.Cmd, *os.File, *os.File, error)
	ExecuteScript(script string, mode string, storageAccountName string) (*exec.Cmd, *os.File, *os.File, error)
}
