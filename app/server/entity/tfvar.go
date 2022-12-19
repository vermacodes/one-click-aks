package entity

// type TfvarResourceGroupType struct {
// 	Location string `json:"location"`
// }

// type TfvarDefaultNodePoolType struct {
// 	EnableAutoScaling bool `json:"enableAutoScaling"`
// 	MinCount          int  `json:"minCount"`
// 	MaxCount          int  `json:"maxCount"`
// }

// type TfvarKubernetesClusterType struct {
// 	KubernetesVersion     string                   `json:"kubernetesVersion"`
// 	NetworkPlugin         string                   `json:"networkPlugin"`
// 	NetworkPolicy         string                   `json:"networkPolicy"`
// 	OutboundType          string                   `json:"outboundType"`
// 	PrivateClusterEnabled string                   `json:"privateClusterEnabled"`
// 	DefaultNodePool       TfvarDefaultNodePoolType `json:"defaultNodePool"`
// }

// type TfvarVirtualNeworkType struct {
// 	AddressSpace []string
// }

// type TfvarSubnetType struct {
// 	Name            string
// 	AddressPrefixes []string
// }

// type TfvarNetworkSecurityGroupType struct {
// }

// type TfvarJumpserverType struct {
// 	AdminPassword string `json:"adminPassword"`
// 	AdminUserName string `json:"adminUsername"`
// }

// type TfvarFirewallType struct {
// 	SkuName string `json:"skuName"`
// 	SkuTier string `json:"skuTier"`
// }

// type ContainerRegistryType struct {
// }

// type TfvarConfigType struct {
// 	ResourceGroup         TfvarResourceGroupType          `json:"resourceGroup"`
// 	VirtualNetworks       []TfvarVirtualNeworkType        `json:"virtualNetworks"`
// 	Subnets               []TfvarSubnetType               `json:"subnets"`
// 	Jumpservers           []TfvarJumpserverType           `json:"jumpservers"`
// 	NetworkSecurityGroups []TfvarNetworkSecurityGroupType `json:"networkSecurityGroups"`
// 	KubernetesCluster     TfvarKubernetesClusterType      `json:"kubernetesCluster"`
// 	Firewalls             []TfvarFirewallType             `json:"firewalls"`
// 	ContainerRegistries   []ContainerRegistryType         `json:"containerRegistries"`
// }

// Interface to implement service.
type TfvarService interface {
	Get() (TfvarConfigType, error)
	Put(TfvarConfigType) (TfvarConfigType, error)
}

// Interface to implement repository.
type TfvarRepository interface {
	Get() (string, error)
	Put(string) (string, error)
}
