package main

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
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

type TfvarJumpserverType struct {
	AdminPassword string `json:"adminPassword"`
	AdminUserName string `json:"adminUsername"`
}

type TfvarFirewallType struct {
	SkuName string `json:"skuName"`
	SkuTier string `json:"skuTier"`
}

type TfvarConfigType struct {
	ResourceGroup     TfvarResourceGroupType     `json:"resourceGroup"`
	VirtualNetworks   []TfvarVirtualNeworkType   `json:"virtualNetworks"`
	Subnets           []TfvarSubnetType          `json:"subnets"`
	Jumpservers       []TfvarJumpserverType      `json:"jumpservers"`
	KubernetesCluster TfvarKubernetesClusterType `json:"kubernetesCluster"`
	Firewalls         []TfvarFirewallType        `json:"firewalls"`
}

var defaultResourceGroup = TfvarResourceGroupType{
	Location: "East US",
}

var defaultNodePool = TfvarDefaultNodePoolType{
	EnableAutoScaling: false,
	MinCount:          1,
	MaxCount:          1,
}

var defaultKubernetesCluster = TfvarKubernetesClusterType{
	NetworkPlugin:         "kubenet",
	NetworkPolicy:         "null",
	OutboundType:          "loadBalancer",
	PrivateClusterEnabled: "false",
	DefaultNodePool:       defaultNodePool,
}

var defaultVirtualNetwork = TfvarVirtualNeworkType{
	AddressSpace: []string{"10.1.0.0/16"},
}

var defaultAzureFirewallSubnet = TfvarSubnetType{
	Name:            "AzureFirewallSubnet",
	AddressPrefixes: []string{"10.1.1.0/24"},
}

var defaultJumpServerSubnet = TfvarSubnetType{
	Name:            "JumpServerSubnet",
	AddressPrefixes: []string{"10.1.2.0/24"},
}

var defaultKubernetesSubnet = TfvarSubnetType{
	Name:            "KubernetesSubnet",
	AddressPrefixes: []string{"10.1.3.0/24"},
}

var defaultJumpServer = TfvarJumpserverType{
	AdminPassword: "Password1234!",
	AdminUserName: "aksadmin",
}

var defaultFirewall = TfvarFirewallType{
	SkuName: "AZFW_VNet",
	SkuTier: "Standard",
}

var defautlTfvar = TfvarConfigType{
	ResourceGroup:     defaultResourceGroup,
	KubernetesCluster: defaultKubernetesCluster,
	VirtualNetworks:   []TfvarVirtualNeworkType{},
	Subnets:           []TfvarSubnetType{},
	Jumpservers:       []TfvarJumpserverType{},
	Firewalls:         []TfvarFirewallType{},
}

func setDefaultTfvar(c *gin.Context) {
	rdb := newRedisClient()
	json, err := json.Marshal(defautlTfvar)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	rdb.Set(ctx, "tfvar", json, 0)
	c.Status(http.StatusCreated)
}

func getTfvar(c *gin.Context) {
	rdb := newRedisClient()

	val, err := rdb.Get(ctx, "tfvar").Result()
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}

	tfvar := TfvarConfigType{}
	if err = json.Unmarshal([]byte(val), &tfvar); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, tfvar)
}

func setTfvar(c *gin.Context) {
	rdb := newRedisClient()
	tfvar := TfvarConfigType{}

	if err := c.BindJSON(&tfvar); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	json, err := json.Marshal(tfvar)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	rdb.Set(ctx, "tfvar", json, 0)
	c.Status(http.StatusCreated)
}
