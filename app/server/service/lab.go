package service

import (
	"encoding/json"
	"sync"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
	"golang.org/x/exp/slog"
)

type labService struct {
	labRepository         entity.LabRepository
	kVersionService       entity.KVersionService
	storageAccountService entity.StorageAccountService // Some information is needed from storage account service.
	authService           entity.AuthService
}

func NewLabService(repo entity.LabRepository, kVersionService entity.KVersionService, storageAccountService entity.StorageAccountService, authService entity.AuthService) entity.LabService {
	return &labService{
		labRepository:         repo,
		kVersionService:       kVersionService,
		storageAccountService: storageAccountService,
		authService:           authService,
	}
}

func (l *labService) GetLabFromRedis() (entity.LabType, error) {
	lab := entity.LabType{}
	out, err := l.labRepository.GetLabFromRedis()
	if err != nil {

		// If the lab was not found in redis then we will set to default.

		slog.Info("lab not found in redis. Setting default.")

		defaultLab, err := l.HelperDefaultLab()
		if err != nil {
			slog.Error("not able to generate default lab", err)
			return lab, err
		}

		if err := l.SetLabInRedis(defaultLab); err != nil {
			slog.Error("not able to set default lab in redis.", err)
		}

		return defaultLab, nil
	}
	slog.Debug("lab found in redis")

	if err := json.Unmarshal([]byte(out), &lab); err != nil {
		slog.Error("not able to unmarshal lab in redis to object", err)
	}

	return lab, nil
}

func (l *labService) SetLabInRedis(lab entity.LabType) error {

	for i := range lab.Template.KubernetesClusters {
		if lab.Template.KubernetesClusters[i].KubernetesVersion == "" {
			lab.Template.KubernetesClusters[i].KubernetesVersion = l.kVersionService.GetDefaultVersion()
		}
	}

	val, err := json.Marshal(lab)
	if err != nil || string(val) == "" {
		slog.Error("not able to marshal object", err)
		return err
	}

	if err := l.labRepository.SetLabInRedis(string(val)); err != nil {
		slog.Error("not able set lab in redis", err)
		return err
	}

	return nil
}

func (l *labService) DeleteLabFromRedis() error {
	return l.labRepository.DeleteLabFromRedis()
}

func (l *labService) GetMyLabs() ([]entity.LabType, error) {
	labs := []entity.LabType{}

	storageAccountName, err := l.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return labs, err
	}

	// Fetching templates is different from fetching labs or mock cases as these are coming from private container.
	// TODO: May be add them to redis to make it work faster.

	blobs := []entity.Blob{}

	out, err := l.labRepository.GetMyLabsFromStorageAccount(storageAccountName)
	if err != nil {
		slog.Error("not able to get my labs from storage account", err)
		return labs, err
	}

	if err = json.Unmarshal([]byte(out), &blobs); err != nil {
		slog.Error("not able to unmarshal the output from cli command to object", err)
		return labs, err
	}

	// Implements go routines and channels.
	// The channel is reading labs on channel.
	wgReader := sync.WaitGroup{}
	ch := make(chan entity.LabType)
	wgReader.Add(1)
	go func() {
		for lab := range ch {
			labs = append(labs, lab)
		}
		wgReader.Done()
	}()

	// Reads the blobs in parallel.
	wgWriter := sync.WaitGroup{}
	for index, blob := range blobs {
		wgWriter.Add(1)
		go func(index int, blobName string) {
			slog.Debug("Lab ", index, blobName)
			out, err = l.labRepository.GetMyLabFromStorageAccount(storageAccountName, blobName)
			if err != nil {
				slog.Error("Error getting template from storage exec command failed", err)
				wgWriter.Done()
				return
			}

			lab := entity.LabType{}
			if err = json.Unmarshal([]byte(out), &lab); err != nil {
				slog.Error("Error reading blob", err)
				wgWriter.Done()
				return
			}
			ch <- lab
			wgWriter.Done()
		}(index, blob.Name)
	}

	wgWriter.Wait() // Wait for all writes.
	close(ch)       // Close channel.
	wgReader.Wait() // Wait for all reads

	return labs, nil
}

func (l *labService) AddMyLab(lab entity.LabType) error {
	storageAccountName, err := l.storageAccountService.GetStorageAccountName()
	if err != nil {
		return err
	}

	// If lab Id is not yet generated Generate
	if lab.Id == "" {
		lab.Id = helper.Generate(20)
	}

	out, err := json.Marshal(lab)
	if err != nil {
		slog.Error("not able to marshal lab object to string.", err)
		return err
	}

	if err := l.labRepository.AddMyLab(storageAccountName, lab.Id, string(out)); err != nil {
		slog.Error("not able to add lab", err)
		return err
	}

	return nil
}

func (l *labService) DeleteMyLab(lab entity.LabType) error {
	storageAccountName, err := l.storageAccountService.GetStorageAccountName()
	if err != nil {
		return err
	}

	if err := l.labRepository.DeleteMyLab(lab.Id, storageAccountName); err != nil {
		slog.Error("not able to delete lab", err)
		return err
	}

	return nil
}

func (l *labService) GetPublicLabs(typeOfLab string) ([]entity.LabType, error) {
	labs := []entity.LabType{}

	er, err := l.labRepository.GetEnumerationResults(typeOfLab)
	if err != nil {
		slog.Error("Not able to get list of blobs", err)
		return labs, err
	}

	for _, element := range er.Blobs.Blob {
		lab, err := l.labRepository.GetLab(element.Name, typeOfLab)
		if err != nil {
			slog.Error("not able to get blob from given url", err)
			continue
		}
		labs = append(labs, lab)
	}

	return labs, nil
}

func (l *labService) HelperDefaultLab() (entity.LabType, error) {

	var defaultResourceGroup = entity.TfvarResourceGroupType{
		Location: "East US",
	}

	var defaultNodePool = entity.TfvarDefaultNodePoolType{
		EnableAutoScaling: false,
		MinCount:          1,
		MaxCount:          1,
	}

	var defaultServiceMesh = entity.TfvarServiceMeshType{
		Enabled:                       false,
		Mode:                          "Istio",
		InternalIngressGatewayEnabled: false,
		ExternalIngressGatewayEnabled: false,
	}

	var defaultAddons = entity.TfvarAddonsType{
		AppGateway:             false,
		MicrosoftDefender:      false,
		VirtualNode:            false,
		HttpApplicationRouting: false,
		ServiceMesh:            defaultServiceMesh,
	}

	var defaultKubernetesClusters = []entity.TfvarKubernetesClusterType{
		{
			KubernetesVersion:     l.kVersionService.GetDefaultVersion(),
			NetworkPlugin:         "kubenet",
			NetworkPolicy:         "null",
			NetworkPluginMode:     "null",
			OutboundType:          "loadBalancer",
			PrivateClusterEnabled: "false",
			Addons:                defaultAddons,
			DefaultNodePool:       defaultNodePool,
		},
	}

	var defaultTfvar = entity.TfvarConfigType{
		ResourceGroup:         defaultResourceGroup,
		KubernetesClusters:    defaultKubernetesClusters,
		VirtualNetworks:       []entity.TfvarVirtualNetworkType{},
		NetworkSecurityGroups: []entity.TfvarNetworkSecurityGroupType{},
		Subnets:               []entity.TfvarSubnetType{},
		Jumpservers:           []entity.TfvarJumpserverType{},
		Firewalls:             []entity.TfvarFirewallType{},
		ContainerRegistries:   []entity.ContainerRegistryType{},
		AppGateways:           []entity.AppGatewayType{},
	}

	extendScript, err := l.labRepository.GetExtendScriptTemplate()
	if err != nil {
		slog.Error("Not able to get extend script template. Defaulting to empty string.", err)
		extendScript = ""
	}

	var defaultLab = entity.LabType{
		Tags:         []string{},
		Template:     defaultTfvar,
		Type:         "privatelab",
		ExtendScript: extendScript,
	}

	return defaultLab, nil
}
