package entity

import (
	"os"
	"os/exec"
)

type Blob struct {
	Name string `xml:"Name" json:"name"`
	Url  string `xml:"Url" json:"url"`
}

// Ok. if you noted that the its named blob and should be Blobs. I've no idea whose fault is this.
// Read more about the API https://learn.microsoft.com/en-us/rest/api/storageservices/list-blobs?tabs=azure-ad#request
type Blobs struct {
	Blob []Blob `xml:"Blob" json:"blob"`
}

type EnumerationResults struct {
	Blobs Blobs `xml:"Blobs" json:"blobs"`
}

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

	GetPublicLabs(typeOfLab string) ([]LabType, error)
	AddPublicLab(LabType) error
	DeletePublicLab(LabType) error

	GetMyLabs() ([]LabType, error)
	AddMyLab(LabType) error
	DeleteMyLab(lab LabType) error
}

type LabRepository interface {
	GetLabFromRedis() (string, error)
	SetLabInRedis(string) error
	TerraformAction(TfvarConfigType, string, string) (*exec.Cmd, *os.File, *os.File, error)

	// Public labs
	GetEnumerationResults(typeOfLab string) (EnumerationResults, error)
	GetLab(url string) (LabType, error)
	AddLab(labId string, lab string, typeOfLab string) error
	DeleteLab(labId string, typeOfLab string) error
	// My Labs
	GetMyLabsFromRedis() (string, error)
	GetMyLabsFromStorageAccount(string) (string, error)
	GetMyLabFromStorageAccount(string, string) (string, error)

	AddMyLab(storageAccountName string, labId string, lab string) error
	DeleteLabsFromRedis() error

	DeleteMyLab(labId string, storageAccountName string) error
}
