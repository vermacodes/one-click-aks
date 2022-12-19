package service

import (
	"encoding/json"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type tfvarService struct {
	tfvarRepo entity.TfvarRepository
}

func NewTfvarService(tfvarRepo entity.TfvarRepository) entity.TfvarService {
	return &tfvarService{
		tfvarRepo: tfvarRepo,
	}
}

func (t *tfvarService) Get() (entity.TfvarConfigType, error) {
	tfvar := entity.TfvarConfigType{}
	val, err := t.tfvarRepo.Get()
	if err != nil {
		slog.Info("not able to get tfvar from redis. setting default", err)

		tfvar, err := t.Put(defaultTfvar())
		if err != nil {
			slog.Error("not able to put default tfvar", err)
		}

		return tfvar, nil
	}

	if err = json.Unmarshal([]byte(val), &tfvar); err != nil {
		slog.Info("not able to unmarshal value from redis to tfvar", err)
		return tfvar, err
	}

	return tfvar, nil
}

func (t *tfvarService) Put(tfvar entity.TfvarConfigType) (entity.TfvarConfigType, error) {
	json, err := json.Marshal(tfvar)
	if err != nil {
		return tfvar, err
	}

	_, err = t.tfvarRepo.Put(string(json))
	if err != nil {
		return tfvar, err
	}

	return tfvar, nil
}

func defaultTfvar() entity.TfvarConfigType {
	var defaultResourceGroup = entity.TfvarResourceGroupType{
		Location: "East US",
	}

	var defaultNodePool = entity.TfvarDefaultNodePoolType{
		EnableAutoScaling: false,
		MinCount:          1,
		MaxCount:          1,
	}

	var defaultKubernetesCluster = entity.TfvarKubernetesClusterType{
		KubernetesVersion:     "",
		NetworkPlugin:         "kubenet",
		NetworkPolicy:         "null",
		OutboundType:          "loadBalancer",
		PrivateClusterEnabled: "false",
		DefaultNodePool:       defaultNodePool,
	}

	var defautlTfvar = entity.TfvarConfigType{
		ResourceGroup:         defaultResourceGroup,
		KubernetesCluster:     defaultKubernetesCluster,
		VirtualNetworks:       []entity.TfvarVirtualNeworkType{},
		NetworkSecurityGroups: []entity.TfvarNetworkSecurityGroupType{},
		Subnets:               []entity.TfvarSubnetType{},
		Jumpservers:           []entity.TfvarJumpserverType{},
		Firewalls:             []entity.TfvarFirewallType{},
		ContainerRegistries:   []entity.ContainerRegistryType{},
	}

	return defautlTfvar
}
