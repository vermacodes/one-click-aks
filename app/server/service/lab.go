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
	storageAccountService entity.StorageAccountService // Some information is needed from storage aacount service.
}

func NewLabService(repo entity.LabRepository, kVersionService entity.KVersionService, storageAccountService entity.StorageAccountService) entity.LabService {
	return &labService{
		labRepository:         repo,
		kVersionService:       kVersionService,
		storageAccountService: storageAccountService,
	}
}

func (l *labService) GetLabFromRedis() (entity.LabType, error) {
	lab := entity.LabType{}
	out, err := l.labRepository.GetLabFromRedis()
	if err != nil {

		// If the lab was not found in redis then we will set to default.

		slog.Error("lab not found in redis. Setting default.", err)

		defaultLab, err := helperDefaultLab(l)
		if err != nil {
			slog.Error("not able to genereate default lab", err)
			return lab, err
		}

		if err := l.SetLabInRedis(defaultLab); err != nil {
			slog.Error("not able to set default lab in redis.", err)
		}

		return defaultLab, nil
	}
	slog.Info("lab found in redis")

	if err := json.Unmarshal([]byte(out), &lab); err != nil {
		slog.Error("not able to unmarshal lab in redis to object", err)
	}

	return lab, nil
}

func (l *labService) SetLabInRedis(lab entity.LabType) error {
	if len(lab.Template.KubernetesClusters) > 0 && lab.Template.KubernetesClusters[0].KubernetesVersion == "" {
		lab.Template.KubernetesClusters[0].KubernetesVersion = l.kVersionService.GetDefaultVersion()
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

func (l *labService) GetPublicLabs(typeOfLab string) ([]entity.LabType, error) {
	labs := []entity.LabType{}
	er, err := l.labRepository.GetEnumerationResults(typeOfLab)
	if err != nil {
		slog.Error("Not able to get list of blobs", err)
		return labs, err
	}

	for _, element := range er.Blobs.Blob {
		lab, err := l.labRepository.GetLab(element.Url)
		if err != nil {
			slog.Error("not able to get blob from given url", err)
			continue
		}
		labs = append(labs, lab)
	}

	return labs, nil
}

func (l *labService) AddPublicLab(lab entity.LabType) error {
	// If lab Id is not yet generated Generate
	if lab.Id == "" {
		lab.Id = helper.Generate(20)
	}

	val, err := json.Marshal(lab)
	if err != nil {
		slog.Error("not able to convert object to string", err)
		return err
	}

	if err := l.labRepository.AddLab(lab.Id, string(val), lab.Type); err != nil {
		slog.Error("not able to save lab", err)
		return err
	}

	return nil
}

func (l *labService) DeletePublicLab(lab entity.LabType) error {
	if err := l.labRepository.DeleteLab(lab.Id, lab.Type); err != nil {
		slog.Error("not able to delete lab", err)
		return err
	}
	return nil
}

func (l *labService) GetMyLabs() ([]entity.LabType, error) {
	labs := []entity.LabType{}

	storageAccountName, err := l.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return labs, err
	}

	// Fetching templates is different from fetching labs or mock cases as these are comming from private container.
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
			slog.Info("Lab ", index, blobName)
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

func helperDefaultLab(l *labService) (entity.LabType, error) {

	var defaultResourceGroup = entity.TfvarResourceGroupType{
		Location: "East US",
	}

	var defaultNodePool = entity.TfvarDefaultNodePoolType{
		EnableAutoScaling: false,
		MinCount:          1,
		MaxCount:          1,
	}

	var defaultAddons = entity.TfvarAddonsType{
		AppGateway:        false,
		MicrosoftDefender: false,
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

	var defautlTfvar = entity.TfvarConfigType{
		ResourceGroup:         defaultResourceGroup,
		KubernetesClusters:    defaultKubernetesClusters,
		VirtualNetworks:       []entity.TfvarVirtualNeworkType{},
		NetworkSecurityGroups: []entity.TfvarNetworkSecurityGroupType{},
		Subnets:               []entity.TfvarSubnetType{},
		Jumpservers:           []entity.TfvarJumpserverType{},
		Firewalls:             []entity.TfvarFirewallType{},
		ContainerRegistries:   []entity.ContainerRegistryType{},
		AppGateways:           []entity.AppGatewayType{},
	}

	var defaultLab = entity.LabType{
		Tags:         []string{},
		Template:     defautlTfvar,
		Type:         "template",
		ExtendScript: "IyEvdXNyL2Jpbi9lbnYgYmFzaA0KDQojIEV4dGVuc2lvbiBTY3JpcHQuIA0KIyANCiMgQWxsIHRoYXQgaXMgbmVlZGVkIGlzIHRvIG1vZGlmeSBlaXRoZXIgdmFsaWRhdGUoKSwgZXh0ZW5kKCkgb3IgZGVzdHJveSgpIGZ1bmN0aW9ucyBpbiB0aGlzIHNjcmlwdC4NCiMgVG8gYXBwbHkgWUFNTHMgeW91IGNhbiBjcmF0ZSBmdW5jdGlvbnMgYW5kIHVzZSBmb3JtYWwgbGlrZSB0aGlzLiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTQzNjQwNjMvMjM1MzQ2MA0KIw0KIw0KIw0KIyBUaGlzIHNjcmlwdCBoYXMgYWNjZXNzIHRvIGFsbCB0aGUgdGVycmFmb3JtIG91dHB1dCB2YXJpYWJsZXMgaW4gYWxsIENBUFMuDQojIFNvbWUgb2YgdGhvc2UgYXJlIGFzIGZvbGxvd3MuDQojDQojDQojDQojIDAxLiAgIEF6dXJlIENvbnRhaW5lciBSZWdpdHJ5IE5hbWUNCiMgICAgICAgICAgIE5hbWUgOiBBQ1JfTkFNRQ0KIyAgICAgICAgICAgVHlwZSA6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzIDogIiIgfCAibmFtZSBvZiB0aGUgYWNyIg0KIyAwMi4gICBBS1MgUHVsbCBDcmVkZW50aWFscyBDb21tYW5kDQojICAgICAgICAgICBOYW1lOiBBS1NfTE9HSU4NCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiYXogYWtzIGdldC1jcmVuZGVudGFpbHMgY29tbWFuZCINCiMgMDMuICAgQUtTIENsdXN0ZXIgTmFtZQ0KIyAgICAgICAgICAgTmFtZTogQ0xVU1RFUl9OQU1FDQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogImNsdXN0ZXItbmFtZSINCiMgMDQuICAgQUtTIENsdXN0ZXIgVmVyc2lvbg0KIyAgICAgICAgICAgTmFtZTogQ0xVU1RFUl9WRVJTSU9ODQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogIjEuMjMuMTIiDQojIDA1LiAgIEZpcmV3YWxsIFByaXZhdGUgSVANCiMgICAgICAgICAgIE5hbWU6IEZJUkVXQUxMX1BSSVZBVEVfSVANCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiIiB8ICIwLjAuMC4wIg0KIyAwNi4gICBOZXR3b3JrIFNlY3VyaXR5IEdyb3VwIE5hbWUNCiMgICAgICAgICAgIE5hbWU6IE5TR19OQU1FDQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogIiIgfCAibnNnX25hbWUiDQojIDA3LiAgIExvY2F0aW9uIHwgQXp1cmUgUmVnaW9uDQojICAgICAgICAgICBOYW1lOiBMT0NBVElPTg0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICJyZWdpb24iDQojIDA4LiAgIFJlc291cmNlIEdyb3VwIE5hbWUNCiMgICAgICAgICAgIE5hbWU6IFJFU09VUkNFX0dST1VQDQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogInJlc291cmNlX2dyb3VwX25hbWUiDQojIDA5LiAgIFZpcnR1YWwgTmV0d29yayBOYW1lDQojICAgICAgICAgICBOYW1lOiBWTkVUX05BTUUNCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiIiB8ICJ2bmV0X25hbWUiDQojIDEwLiAgIENsdXN0ZXIgTWFuYWdlZCBTZXJ2aWNlIElkZW50aXR5IElEDQojICAgICAgICAgICBOYW1lOiBDTFVTVEVSX01TSV9JRA0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICIiIHwgImNsdXN0ZXJfbXNpX2lkIg0KIyAxMS4gICBLdWJlbGV0IE1hbmFnZWQgU2VydmljZSBJZGVudGl0eSBJRA0KIyAgICAgICAgICAgTmFtZTogS1VCRUxFVF9NU0lfSUQNCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiIiB8ICJrdWJlbGV0X21zaV9pZCINCiMNCiMNCiMNCiMgU2hhcmVkIGZ1bmN0aW9ucyB0aGF0IHRoaXMgc2NyaXB0IGhhcyBhY2Nlc3MgdG8uDQojDQojDQojIDAxLiAgIExvZ2luZw0KIyAgICAgICBsb2coKQ0KIyAgICAgICBBcmdzOiAic3RyaW5nIg0KIyAgICAgICBFeGFtcGxlOiBsb2cgInRoaXMgc3RhdGVtZW50IHdpbGwgYmUgbG9nZ2VkIg0KIw0KIyAwMy4gICBHcmVlbiAoT0spIExvZ2dpbmcNCiMgICAgICAgb2soKQ0KIyAgICAgICBBcmdzOiAic3RyaW5nIg0KIyAgICAgICBFeGFtcGxlOiBvayAidGhpcyBzdGF0ZW1lbnQgd2lsbCBiZSBsb2dnZWQgYXMgSU5GTyBsb2cgaW4gZ3JlZW4gY29sb3IiDQojDQojIDAzLiAgIEVycm9yIExvZ2dpbmcNCiMgICAgICAgZXJyKCkNCiMgICAgICAgQXJnczogKFN0cmluZykNCiMgICAgICAgRXhhbXBsZTogZXJyICJ0aGlzIGVycm9yIG9jY3J1cmVkIg0KIw0KDQojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjDQojICAgRE8gTk9UIE1PRElGWSBBQk9WRSBUSElTIExJTkUgICAjDQojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjDQoNCmZ1bmN0aW9uIHZhbGlkYXRlKCkgew0KICAgICMgQWRkIHlvdXIgY29kZSBoZXJlIGZvciB2YWxpZGF0aW9uDQogICAgb2sgIm5vdGhpbmcgdG8gdmFsaWRhdGUiDQp9DQoNCmZ1bmN0aW9uIGRlc3Ryb3koKSB7DQogICAgIyBBZGQgeW91ciBjb2RlIGhlcmUgdG8gYmUgZXhlY3V0ZWQgYmVmb3JlIGRlc3RydWN0aW9uDQogICAgb2sgIm5vdGhpbmcgdG8gZGVzdHJveSINCn0NCg0KZnVuY3Rpb24gZXh0ZW5kKCkgew0KICAgICMgQWRkIHlvdXIgY29kZSBoZXJlIHRvIGJlIGV4ZWN1dGVkIGFmdGVyIGFwcGx5DQogICAgb2sgIm5vdGhpbmcgdG8gZXh0ZW5kIg0KfQ0KDQojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjDQojICAgRE8gTk9UIE1PRElGWSBCRUxPVyBUSElTIExJTkUgICAjDQojIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjDQoNCiMjDQojIyBTY3JpcHQgc3RhcnRzIGhlcmUuDQojIw0KDQojSW5pdGlhbGl6ZSB0aGUgZW52aXJvbm1lbnQuDQpzb3VyY2UgJFJPT1RfRElSL3NjcmlwdHMvaGVscGVyLnNoICYmIGluaXQNCg0Kb2sgImJlZ2luaW5nIG9mIGV4dGVuc2lvbiBzY3JpcHQiDQoNCiMgY2FsbHMgdGhlIG1ldGhvZCB5b3UgYWRkZWQgdGhlIGNvZGUgdG8uDQppZiBbWyAke1NDUklQVF9NT0RFfSA9PSAiYXBwbHkiIF1dOyB0aGVuDQogICAgZXh0ZW5kDQplbGlmIFtbICR7U0NSSVBUX01PREV9ID09ICJkZXN0cm95IiBdXTsgdGhlbg0KICAgIGRlc3Ryb3kNCmVsaWYgW1sgJHtTQ1JJUFRfTU9ERX0gPT0gInZhbGlkYXRlIiBdXTsgdGhlbg0KICAgIHZhbGlkYXRlDQpmaQ0KDQpvayAiZW5kIG9mIGV4dGVuc2lvbiBzY3JpcHQi",
	}

	return defaultLab, nil
}
