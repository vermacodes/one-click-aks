package service

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"sync"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
	"golang.org/x/exp/slog"
)

type labService struct {
	labRepository       entity.LabRepository
	logStreamService    entity.LogStreamService
	actionStatusService entity.ActionStatusService
	kVersionService     entity.KVersionService
	//tfvarService          entity.TfvarService
	storageAccountService entity.StorageAccountService // Some information is needed from storage aacount service.
}

func NewLabService(repo entity.LabRepository, logStreamService entity.LogStreamService, actionStatusService entity.ActionStatusService, kVersionService entity.KVersionService, storageAccountService entity.StorageAccountService) entity.LabService {
	return &labService{
		labRepository:       repo,
		logStreamService:    logStreamService,
		actionStatusService: actionStatusService,
		kVersionService:     kVersionService,
		//tfvarService:          tfvarService,
		storageAccountService: storageAccountService,
	}
}

func (l *labService) GetLabFromRedis() (entity.LabType, error) {
	lab := entity.LabType{}
	out, err := l.labRepository.GetLabFromRedis()
	if err != nil {
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
	val, err := json.Marshal(lab)
	if err != nil {
		slog.Error("not able to marshal object", err)
		return err
	}

	if err := l.labRepository.SetLabInRedis(string(val)); err != nil {
		slog.Error("not able set lab in redis", err)
		return err
	}

	return nil
}

func (l *labService) Init() error {
	lab, err := l.GetLabFromRedis()
	if err != nil {
		slog.Error("not able to get lab from redis", err)
	}
	return helperTerraformAction(l, lab.Template, "init")
}

func (l *labService) Plan(lab entity.LabType) error {
	return helperTerraformAction(l, lab.Template, "plan")
}

func (l *labService) Apply(lab entity.LabType) error {
	return helperTerraformAction(l, lab.Template, "apply")

	//TODO : Extenstion script
}

func (l *labService) Destroy(lab entity.LabType) error {
	return helperTerraformAction(l, lab.Template, "destroy")
}

func (l *labService) Validate() error {
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

func helperTerraformAction(l *labService, tfvar entity.TfvarConfigType, action string) error {

	actionStaus, err := l.actionStatusService.GetActionStatus()
	if err != nil {
		slog.Error("not able to get current action status", err)

		// Defaulting to no action
		actionStaus := entity.ActionStatus{
			InProgress: false,
		}
		if err := l.actionStatusService.SetActionStatus(actionStaus); err != nil {
			slog.Error("not able to set default action status.", err)
		}
	}

	if actionStaus.InProgress {
		slog.Error("Error", errors.New("action already in progress"))
		return errors.New("action already in progress")
	}

	actionStaus.InProgress = true
	l.actionStatusService.SetActionStatus(actionStaus)

	storageAccountName, err := l.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return err
	}

	cmd, rPipe, wPipe, err := l.labRepository.TerraformAction(tfvar, action, storageAccountName)
	if err != nil {
		slog.Error("not able to run terraform script", err)
	}

	// GO routine that takes care of running command and moving logs to redis.
	go func(input io.ReadCloser) {
		in := bufio.NewScanner(input)
		logStream := entity.LogStream{
			Logs:        "",
			IsStreaming: true,
		}
		for in.Scan() {
			logStream.Logs = logStream.Logs + fmt.Sprintf("%s\n", in.Text()) // Appening 'end' to signal stream end.
			l.logStreamService.SetLogs(logStream)
		}
		input.Close()
	}(rPipe)

	cmd.Wait()
	wPipe.Close()
	l.logStreamService.EndLogStream()

	actionStaus.InProgress = false
	l.actionStatusService.SetActionStatus(actionStaus)

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

	var defaultKubernetesCluster = entity.TfvarKubernetesClusterType{
		KubernetesVersion:     l.kVersionService.GetDefaultVersion(),
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

	var defaultLab = entity.LabType{
		Tags:     []string{},
		Template: defautlTfvar,
		Type:     "template",
	}

	return defaultLab, nil
}
