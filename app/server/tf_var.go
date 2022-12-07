package main

import (
	"encoding/json"
	"errors"
	"log"
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

var defaultResourceGroup = TfvarResourceGroupType{
	Location: "East US",
}

var defaultNodePool = TfvarDefaultNodePoolType{
	EnableAutoScaling: false,
	MinCount:          1,
	MaxCount:          1,
}

var defaultKubernetesCluster = TfvarKubernetesClusterType{
	KubernetesVersion:     "",
	NetworkPlugin:         "kubenet",
	NetworkPolicy:         "null",
	OutboundType:          "loadBalancer",
	PrivateClusterEnabled: "false",
	DefaultNodePool:       defaultNodePool,
}

var defaultVirtualNetwork = TfvarVirtualNeworkType{
	AddressSpace: []string{"10.1.0.0/16"},
}

//var defaultNetworkSecurityGroup = TfvarNetworkSecurityGroupType{}

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

//var defaultContainerRegistry = ContainerRegistryType{}

var defautlTfvar = TfvarConfigType{
	ResourceGroup:         defaultResourceGroup,
	KubernetesCluster:     defaultKubernetesCluster,
	VirtualNetworks:       []TfvarVirtualNeworkType{},
	NetworkSecurityGroups: []TfvarNetworkSecurityGroupType{},
	Subnets:               []TfvarSubnetType{},
	Jumpservers:           []TfvarJumpserverType{},
	Firewalls:             []TfvarFirewallType{},
	ContainerRegistries:   []ContainerRegistryType{},
}

func setDefaultTfvarService() (TfvarConfigType, error) {
	rdb := newRedisClient()

	defautlTfvar.KubernetesCluster.KubernetesVersion = getDefaultKubernetesOrchestratorHelper().OrchestratorVersion
	json, err := json.Marshal(defautlTfvar)
	if err != nil {
		log.Println("Not able to Marshal default tfvar to json []byte")
		return defautlTfvar, errors.New("not able to marshal default tfvar to json []byte")
	}

	rdb.Set(ctx, "tfvar", json, 0)
	return defautlTfvar, nil
}

func setDefaultTfvar(c *gin.Context) {
	if _, err := setDefaultTfvarService(); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.Status(http.StatusCreated)
}

func getTfvarService() (TfvarConfigType, error) {

	rdb := newRedisClient()
	tfvar := TfvarConfigType{}

	loginStatus := validateLoginService()
	if !loginStatus.IsLoggedIn {
		return tfvar, errors.New("403")
	}

	val, err := rdb.Get(ctx, "tfvar").Result()

	// tfvar is set to a default state as soon as the user login is done. If something bad were to
	// happen to the redis and if we lose the tfvar value and its no found in redis.
	// That would a error we need to handle. To handle that,
	// we set that tfvar back to its default state.
	if err != nil {
		log.Println("Not able to find tfvar in Redis. Sending default.", err)
		tfvar, err = setDefaultTfvarService()
		log.Println("Reached here ", tfvar)
		if err != nil {
			log.Println("Not able to set default tfvar", err)
			return tfvar, err
		}
	} else { // Unmarshal value to tfvar only if it was found in redis. Else no need.
		if err = json.Unmarshal([]byte(val), &tfvar); err != nil {
			log.Println("Not able to Unmarshal tfvar in redis to object", err)
			return tfvar, err
		}
	}

	// Inject Azure Region based on Preference
	// May not be the right way of doing this.
	preference := getPreferenceFromRedis()
	if (preference != Preference{}) {
		tfvar.ResourceGroup.Location = preference.AzureRegion
	} else {
		// Get from blob
		log.Println("Preference not found in redis. getting from blob.")
		preference = getPreferenceFromBlob()
		if (preference != Preference{}) {
			tfvar.ResourceGroup.Location = preference.AzureRegion
		} else {
			// Default to East US
			log.Println("Preference not found in blob, defaulting to East US")
			tfvar.ResourceGroup.Location = "East US"
		}
		// Put in redis.
		putPreferenceInRedis(preference)
	}

	return tfvar, nil
}

func getTfvar(c *gin.Context) {
	tfvar, err := getTfvarService()
	if err != nil {
		if err.Error() == "403" {
			c.Status(http.StatusUnauthorized)
		} else {
			c.Status(http.StatusInternalServerError)
		}
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
