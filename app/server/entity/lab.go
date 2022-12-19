package entity

import (
	"os"
	"os/exec"
)

type TfvarResourceGroupType struct {
	Location string `json:"location"`
}

type TfvarDefaultNodePoolType struct {
	EnableAutoScaling bool `json:"enableAutoScaling"`
	MinCount          int  `json:"minCount"`
	MaxCount          int  `json:"maxCount"`
}

type TfvarKubernetesClusterType struct {
	KubernetesVersion     string                   `json:"kubernetesVersion"`
	NetworkPlugin         string                   `json:"networkPlugin"`
	NetworkPolicy         string                   `json:"networkPolicy"`
	OutboundType          string                   `json:"outboundType"`
	PrivateClusterEnabled string                   `json:"privateClusterEnabled"`
	DefaultNodePool       TfvarDefaultNodePoolType `json:"defaultNodePool"`
}

type TfvarVirtualNeworkType struct {
	AddressSpace []string
}

type TfvarSubnetType struct {
	Name            string
	AddressPrefixes []string
}

type TfvarNetworkSecurityGroupType struct {
}

type TfvarJumpserverType struct {
	AdminPassword string `json:"adminPassword"`
	AdminUserName string `json:"adminUsername"`
}

type TfvarFirewallType struct {
	SkuName string `json:"skuName"`
	SkuTier string `json:"skuTier"`
}

type ContainerRegistryType struct {
}

type TfvarConfigType struct {
	ResourceGroup         TfvarResourceGroupType          `json:"resourceGroup"`
	VirtualNetworks       []TfvarVirtualNeworkType        `json:"virtualNetworks"`
	Subnets               []TfvarSubnetType               `json:"subnets"`
	Jumpservers           []TfvarJumpserverType           `json:"jumpservers"`
	NetworkSecurityGroups []TfvarNetworkSecurityGroupType `json:"networkSecurityGroups"`
	KubernetesCluster     TfvarKubernetesClusterType      `json:"kubernetesCluster"`
	Firewalls             []TfvarFirewallType             `json:"firewalls"`
	ContainerRegistries   []ContainerRegistryType         `json:"containerRegistries"`
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
	TerraformAction(TfvarConfigType, string, string) (*exec.Cmd, *os.File, *os.File, error)
}
