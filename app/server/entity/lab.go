package entity

var SasToken string
var StorageAccountName string

type TfvarResourceGroupType struct {
	Location string `json:"location"`
}

type TfvarDefaultNodePoolType struct {
	EnableAutoScaling bool `json:"enableAutoScaling"`
	MinCount          int  `json:"minCount"`
	MaxCount          int  `json:"maxCount"`
}

type TfvarServiceMeshType struct {
	Enabled                       bool   `json:"enabled"`
	Mode                          string `json:"mode"`
	InternalIngressGatewayEnabled bool   `json:"internalIngressGatewayEnabled"`
	ExternalIngressGatewayEnabled bool   `json:"externalIngressGatewayEnabled"`
}

type TfvarAddonsType struct {
	AppGateway             bool                 `json:"appGateway"`
	MicrosoftDefender      bool                 `json:"microsoftDefender"`
	VirtualNode            bool                 `json:"virtualNode"`
	HttpApplicationRouting bool                 `json:"httpApplicationRouting"`
	ServiceMesh            TfvarServiceMeshType `json:"serviceMesh"`
}

type TfvarKubernetesClusterType struct {
	KubernetesVersion     string                   `json:"kubernetesVersion"`
	NetworkPlugin         string                   `json:"networkPlugin"`
	NetworkPolicy         string                   `json:"networkPolicy"`
	NetworkPluginMode     string                   `json:"networkPluginMode"`
	OutboundType          string                   `json:"outboundType"`
	PrivateClusterEnabled string                   `json:"privateClusterEnabled"`
	Addons                TfvarAddonsType          `json:"addons"`
	DefaultNodePool       TfvarDefaultNodePoolType `json:"defaultNodePool"`
}

type TfvarVirtualNetworkType struct {
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

type AppGatewayType struct{}

type TfvarConfigType struct {
	ResourceGroup         TfvarResourceGroupType          `json:"resourceGroup"`
	VirtualNetworks       []TfvarVirtualNetworkType       `json:"virtualNetworks"`
	Subnets               []TfvarSubnetType               `json:"subnets"`
	Jumpservers           []TfvarJumpserverType           `json:"jumpservers"`
	NetworkSecurityGroups []TfvarNetworkSecurityGroupType `json:"networkSecurityGroups"`
	KubernetesClusters    []TfvarKubernetesClusterType    `json:"kubernetesClusters"`
	Firewalls             []TfvarFirewallType             `json:"firewalls"`
	ContainerRegistries   []ContainerRegistryType         `json:"containerRegistries"`
	AppGateways           []AppGatewayType                `json:"appGateways"`
}

type Blob struct {
	Name string `xml:"Name" json:"name"`
	//Url  string `xml:"Url" json:"url"`
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
	Id               string          `json:"id"`
	Name             string          `json:"name"`
	Description      string          `json:"description"`
	Tags             []string        `json:"tags"`
	Template         TfvarConfigType `json:"template"`
	ExtendScript     string          `json:"extendScript"`
	Message          string          `json:"message"`
	Category         string          `json:"category"`
	Type             string          `json:"type"`
	CreatedBy        string          `json:"createdBy"`
	CreatedOn        string          `json:"createdOn"`
	UpdatedBy        string          `json:"updatedBy"`
	UpdatedOn        string          `json:"updatedOn"`
	Owners           []string        `json:"owners"`
	Editors          []string        `json:"editors"`
	Viewers          []string        `json:"viewers"`
	VersionId        string          `json:"versionId"`
	IsCurrentVersion bool            `json:"isCurrentVersion"`
}

type BlobType struct {
	Name      string `json:"name"`
	Url       string `json:"url"`
	VersionId string `json:"versionId"`
}

type LabService interface {
	GetLabFromRedis() (LabType, error)
	SetLabInRedis(LabType) error
	DeleteLabFromRedis() error

	// Public Labs
	// Includes = sharedlabs, readinesslabs, mockcases.
	GetPublicLabs(typeOfLab string) ([]LabType, error)

	// Private Labs
	// Includes labs that are saved in your own subscription.
	GetMyLabs() ([]LabType, error)
	AddMyLab(LabType) error
	DeleteMyLab(lab LabType) error
	HelperDefaultLab() (LabType, error)
}

type LabRepository interface {
	GetLabFromRedis() (string, error)
	SetLabInRedis(string) error
	DeleteLabFromRedis() error

	GetExtendScriptTemplate() (string, error)

	// Public labs
	GetEnumerationResults(typeOfLab string) (EnumerationResults, error)
	GetLab(name string, typeOfLab string) (LabType, error)

	// My Labs
	GetMyLabsFromRedis() (string, error)
	GetMyLabsFromStorageAccount(string) (string, error)
	GetMyLabFromStorageAccount(string, string) (string, error)

	AddMyLab(storageAccountName string, labId string, lab string) error
	DeleteLabsFromRedis() error

	DeleteMyLab(labId string, storageAccountName string) error
}
