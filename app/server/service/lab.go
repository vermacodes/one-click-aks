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

	// var defaultNodePool = entity.TfvarDefaultNodePoolType{
	// 	EnableAutoScaling: false,
	// 	MinCount:          1,
	// 	MaxCount:          1,
	// }

	// var defaultAddons = entity.TfvarAddonsType{
	// 	AppGateway:        false,
	// 	MicrosoftDefender: false,
	// }

	// var defaultKubernetesCluster = entity.TfvarKubernetesClusterType{
	// 	KubernetesVersion:     l.kVersionService.GetDefaultVersion(),
	// 	NetworkPlugin:         "kubenet",
	// 	NetworkPolicy:         "null",
	// 	NetworkPluginMode:     "null",
	// 	OutboundType:          "loadBalancer",
	// 	PrivateClusterEnabled: "false",
	// 	Addons:                defaultAddons,
	// 	DefaultNodePool:       defaultNodePool,
	// }

	var defautlTfvar = entity.TfvarConfigType{
		ResourceGroup:         defaultResourceGroup,
		KubernetesClusters:    []entity.TfvarKubernetesClusterType{},
		VirtualNetworks:       []entity.TfvarVirtualNeworkType{},
		NetworkSecurityGroups: []entity.TfvarNetworkSecurityGroupType{},
		Subnets:               []entity.TfvarSubnetType{},
		Jumpservers:           []entity.TfvarJumpserverType{},
		Firewalls:             []entity.TfvarFirewallType{},
		ContainerRegistries:   []entity.ContainerRegistryType{},
		AppGateways:           []entity.AppGatewayType{},
	}

	var defaultLab = entity.LabType{
		Tags:           []string{},
		Template:       defautlTfvar,
		Type:           "template",
		ExtendScript:   "IyEvdXNyL2Jpbi9lbnYgYmFzaA0KDQojIFRoaXMgaXMgYSB0ZW1wbGF0ZSB0byBnZW5lcmF0ZSBleHRlbmQgYW5kIHZhbGlkYXRlIHNjcmlwdHMuIA0KIyANCiMgQWxsIHRoYXQgaXMgbmVlZGVkIGlzIHRvIG1vZGlmeSBlaXRoZXIgdmFsaWRhdGUoKSBvciBleHRlbmQoKSBmdW5jdGlvbnMgaW4gdGhpcyBzY3JpcHQuDQojIFRvIGFwcGx5IFlBTUxzIHlvdSBjYW4gY3JhdGUgZnVuY3Rpb25zIGFuZCB1c2UgZm9ybWFsIGxpa2UgdGhpcy4gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzU0MzY0MDYzLzIzNTM0NjANCiMNCiMNCiMNCiMgRW52aXJvbm1lbnQgVmFyaWFibGVzIHRoYXQgdGhpcyBzY3JpcHQgaGFzIGFjY2VzcyB0by4NCiMNCiMNCiMNCiMgMDEuICAgQXp1cmUgQ29udGFpbmVyIFJlZ2l0cnkgTmFtZQ0KIyAgICAgICAgICAgTmFtZSA6IEFDUl9OQU1FDQojICAgICAgICAgICBUeXBlIDogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXMgOiAiIiB8ICJuYW1lIG9mIHRoZSBhY3IiDQojIDAyLiAgIEFLUyBQdWxsIENyZWRlbnRpYWxzIENvbW1hbmQNCiMgICAgICAgICAgIE5hbWU6IEFLU19MT0dJTg0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICJheiBha3MgZ2V0LWNyZW5kZW50YWlscyBjb21tYW5kIg0KIyAwMy4gICBBS1MgQ2x1c3RlciBOYW1lDQojICAgICAgICAgICBOYW1lOiBDTFVTVEVSX05BTUUNCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiY2x1c3Rlci1uYW1lIg0KIyAwNC4gICBBS1MgQ2x1c3RlciBWZXJzaW9uDQojICAgICAgICAgICBOYW1lOiBDTFVTVEVSX1ZFUlNJT04NCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiMS4yMy4xMiINCiMgMDUuICAgRmlyZXdhbGwgUHJpdmF0ZSBJUA0KIyAgICAgICAgICAgTmFtZTogRklSRVdBTExfUFJJVkFURV9JUA0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICIiIHwgIjAuMC4wLjAiDQojIDA2LiAgIE5ldHdvcmsgU2VjdXJpdHkgR3JvdXAgTmFtZQ0KIyAgICAgICAgICAgTmFtZTogTlNHX05BTUUNCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiIiB8ICJuc2dfbmFtZSINCiMgMDcuICAgTG9jYXRpb24gfCBBenVyZSBSZWdpb24NCiMgICAgICAgICAgIE5hbWU6IExPQ0FUSU9ODQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogInJlZ2lvbiINCiMgMDguICAgUmVzb3VyY2UgR3JvdXAgTmFtZQ0KIyAgICAgICAgICAgTmFtZTogUkVTT1VSQ0VfR1JPVVANCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAicmVzb3VyY2VfZ3JvdXBfbmFtZSINCiMgMDkuICAgVmlydHVhbCBOZXR3b3JrIE5hbWUNCiMgICAgICAgICAgIE5hbWU6IFZORVRfTkFNRQ0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICIiIHwgInZuZXRfbmFtZSINCiMgMDkuICAgQ2x1c3RlciBNYW5hZ2VkIFNlcnZpY2UgSWRlbnRpdHkgSUQNCiMgICAgICAgICAgIE5hbWU6IENMVVNURVJfTVNJX0lEDQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogIiIgfCAiY2x1c3Rlcl9tc2lfaWQiDQojIDA5LiAgIEt1YmVsZXQgTWFuYWdlZCBTZXJ2aWNlIElkZW50aXR5IElEDQojICAgICAgICAgICBOYW1lOiBLVUJFTEVUX01TSV9JRA0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICIiIHwgImt1YmVsZXRfbXNpX2lkIg0KIw0KIw0KIw0KIyBTaGFyZWQgZnVuY3Rpb25zIHRoYXQgdGhpcyBzY3JpcHQgaGFzIGFjY2VzcyB0by4NCiMNCiMNCiMgMDEuICAgTG9naW5nDQojICAgICAgIGxvZygpDQojICAgICAgIEFyZ3M6IChzdHJpbmcpDQojICAgICAgIEV4YW1wbGU6IGxvZyAidGhpcyBzdGF0ZW1ldG4gd2lsbCBiZSBsb2dnZWQiDQojDQojIDAyLiAgIEVycm9yIExvZ2dpbmcNCiMgICAgICAgZXJyKCkNCiMgICAgICAgQXJnczogKFN0cmluZykNCiMgICAgICAgRXhhbXBsZTogZXJyICJ0aGlzIGVycm9yIG9jY3J1cmVkIg0KIw0KDQpmdW5jdGlvbiB2YWxpZGF0ZSgpIHsNCiAgICAjIEFkZCB5b3VyIGNvZGUgaGVyZSBmb3IgdmFsaWRhdGlvbg0KICAgIGxvZyAibm90aGluZyB0byB2YWxpZGF0ZSINCn0NCg0KZnVuY3Rpb24gZXh0ZW5kKCkgew0KICAgIGxvZyAibm90aGluZyB0byBleHRlbmQiDQp9DQoNCiMjDQojIyBTY3JpcHQgc3RhcnRzIGhlcmUuDQojIw0KDQojSW5pdGlhbGl6ZSB0aGUgZW52aXJvbm1lbnQuDQpzb3VyY2UgJFJPT1RfRElSL3NjcmlwdHMvaGVscGVyLnNoICYmIGluaXQNCg0KbG9nICJFeHRlbmRpbmcgQ2x1c3RlciINCg0KIyBjYWxsIHRoZSBtZXRob2QgeW91IGFkZGVkIHRoZSBjb2RlIHRvLg0KZXh0ZW5kDQoNCmxvZyAiZW5kIG9mIGV4dGVuc2lvbiBzY3JpcHQi",
		ValidateScript: "IyEvdXNyL2Jpbi9lbnYgYmFzaA0KDQojIFRoaXMgaXMgYSB0ZW1wbGF0ZSB0byBnZW5lcmF0ZSBleHRlbmQgYW5kIHZhbGlkYXRlIHNjcmlwdHMuIA0KIyANCiMgQWxsIHRoYXQgaXMgbmVlZGVkIGlzIHRvIG1vZGlmeSBlaXRoZXIgdmFsaWRhdGUoKSBvciBleHRlbmQoKSBmdW5jdGlvbnMgaW4gdGhpcyBzY3JpcHQuDQojIFRvIGFwcGx5IFlBTUxzIHlvdSBjYW4gY3JhdGUgZnVuY3Rpb25zIGFuZCB1c2UgZm9ybWFsIGxpa2UgdGhpcy4gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzU0MzY0MDYzLzIzNTM0NjANCiMNCiMNCiMNCiMgRW52aXJvbm1lbnQgVmFyaWFibGVzIHRoYXQgdGhpcyBzY3JpcHQgaGFzIGFjY2VzcyB0by4NCiMNCiMNCiMNCiMgMDEuICAgQXp1cmUgQ29udGFpbmVyIFJlZ2l0cnkgTmFtZQ0KIyAgICAgICAgICAgTmFtZSA6IEFDUl9OQU1FDQojICAgICAgICAgICBUeXBlIDogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXMgOiAiIiB8ICJuYW1lIG9mIHRoZSBhY3IiDQojIDAyLiAgIEFLUyBQdWxsIENyZWRlbnRpYWxzIENvbW1hbmQNCiMgICAgICAgICAgIE5hbWU6IEFLU19MT0dJTg0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICJheiBha3MgZ2V0LWNyZW5kZW50YWlscyBjb21tYW5kIg0KIyAwMy4gICBBS1MgQ2x1c3RlciBOYW1lDQojICAgICAgICAgICBOYW1lOiBDTFVTVEVSX05BTUUNCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiY2x1c3Rlci1uYW1lIg0KIyAwNC4gICBBS1MgQ2x1c3RlciBWZXJzaW9uDQojICAgICAgICAgICBOYW1lOiBDTFVTVEVSX1ZFUlNJT04NCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiMS4yMy4xMiINCiMgMDUuICAgRmlyZXdhbGwgUHJpdmF0ZSBJUA0KIyAgICAgICAgICAgTmFtZTogRklSRVdBTExfUFJJVkFURV9JUA0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICIiIHwgIjAuMC4wLjAiDQojIDA2LiAgIE5ldHdvcmsgU2VjdXJpdHkgR3JvdXAgTmFtZQ0KIyAgICAgICAgICAgTmFtZTogTlNHX05BTUUNCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAiIiB8ICJuc2dfbmFtZSINCiMgMDcuICAgTG9jYXRpb24gfCBBenVyZSBSZWdpb24NCiMgICAgICAgICAgIE5hbWU6IExPQ0FUSU9ODQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogInJlZ2lvbiINCiMgMDguICAgUmVzb3VyY2UgR3JvdXAgTmFtZQ0KIyAgICAgICAgICAgTmFtZTogUkVTT1VSQ0VfR1JPVVANCiMgICAgICAgICAgIFR5cGU6IHN0cmluZw0KIyAgICAgICAgICAgRXhwZWN0ZWQgVmFsdWVzOiAicmVzb3VyY2VfZ3JvdXBfbmFtZSINCiMgMDkuICAgVmlydHVhbCBOZXR3b3JrIE5hbWUNCiMgICAgICAgICAgIE5hbWU6IFZORVRfTkFNRQ0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICIiIHwgInZuZXRfbmFtZSINCiMgMDkuICAgQ2x1c3RlciBNYW5hZ2VkIFNlcnZpY2UgSWRlbnRpdHkgSUQNCiMgICAgICAgICAgIE5hbWU6IENMVVNURVJfTVNJX0lEDQojICAgICAgICAgICBUeXBlOiBzdHJpbmcNCiMgICAgICAgICAgIEV4cGVjdGVkIFZhbHVlczogIiIgfCAiY2x1c3Rlcl9tc2lfaWQiDQojIDA5LiAgIEt1YmVsZXQgTWFuYWdlZCBTZXJ2aWNlIElkZW50aXR5IElEDQojICAgICAgICAgICBOYW1lOiBLVUJFTEVUX01TSV9JRA0KIyAgICAgICAgICAgVHlwZTogc3RyaW5nDQojICAgICAgICAgICBFeHBlY3RlZCBWYWx1ZXM6ICIiIHwgImt1YmVsZXRfbXNpX2lkIg0KIw0KIw0KIw0KIyBTaGFyZWQgZnVuY3Rpb25zIHRoYXQgdGhpcyBzY3JpcHQgaGFzIGFjY2VzcyB0by4NCiMNCiMNCiMgMDEuICAgTG9naW5nDQojICAgICAgIGxvZygpDQojICAgICAgIEFyZ3M6IChzdHJpbmcpDQojICAgICAgIEV4YW1wbGU6IGxvZyAidGhpcyBzdGF0ZW1ldG4gd2lsbCBiZSBsb2dnZWQiDQojDQojIDAyLiAgIEVycm9yIExvZ2dpbmcNCiMgICAgICAgZXJyKCkNCiMgICAgICAgQXJnczogKFN0cmluZykNCiMgICAgICAgRXhhbXBsZTogZXJyICJ0aGlzIGVycm9yIG9jY3J1cmVkIg0KIw0KDQpmdW5jdGlvbiB2YWxpZGF0ZSgpIHsNCiAgICAjIEFkZCB5b3VyIGNvZGUgaGVyZSBmb3IgdmFsaWRhdGlvbg0KICAgIGxvZyAibm90aGluZyB0byB2YWxpZGF0ZSINCn0NCg0KZnVuY3Rpb24gZXh0ZW5kKCkgew0KICAgICMgUHVsbGluZyBpbWFnZSBkb3duIHRvIHRoZSBBQ1IuDQogICAgbG9nICJub3RoaW5nIHRvIGV4dGVuZCINCn0NCg0KIyMNCiMjIFNjcmlwdCBzdGFydHMgaGVyZS4NCiMjDQoNCiNJbml0aWFsaXplIHRoZSBlbnZpcm9ubWVudC4NCnNvdXJjZSAkUk9PVF9ESVIvc2NyaXB0cy9oZWxwZXIuc2ggJiYgaW5pdA0KDQpsb2cgIlZhbGlkYXRpbmcgQ2x1c3RlciINCg0KIyBjYWxsIHRoZSBtZXRob2QgeW91IGFkZGVkIHRoZSBjb2RlIHRvLg0KdmFsaWRhdGUNCg0KbG9nICJlbmQgb2YgdmFsaWRhdGlvbiBzY3JpcHQi",
	}

	return defaultLab, nil
}
