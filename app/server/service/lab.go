package service

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type labService struct {
	labRepository         entity.LabRepository
	logStreamService      entity.LogStreamService
	actionStatusService   entity.ActionStatusService
	tfvarService          entity.TfvarService
	storageAccountService entity.StorageAccountService // Some information is needed from storage aacount service.
}

func NewLabService(repo entity.LabRepository, logStreamService entity.LogStreamService, actionStatusService entity.ActionStatusService, tfvarService entity.TfvarService, storageAccountService entity.StorageAccountService) entity.LabService {
	return &labService{
		labRepository:         repo,
		logStreamService:      logStreamService,
		actionStatusService:   actionStatusService,
		tfvarService:          tfvarService,
		storageAccountService: storageAccountService,
	}
}

func (l *labService) GetLabFromRedis() (entity.LabType, error) {
	lab := entity.LabType{}
	out, err := l.labRepository.GetLabFromRedis()
	if err != nil {
		slog.Error("lab not found in redis. Setting default.", err)

		defaultLab, err := helperDefaultLab(l.tfvarService)
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

func helperTerraformAction(l *labService, tfvar entity.TfvarConfigType, action string) error {

	actionStaus, err := l.actionStatusService.GetActionStatus()
	if err != nil {
		slog.Error("not able to get current action status", err)
		return err
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

func helperDefaultLab(t entity.TfvarService) (entity.LabType, error) {

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

	var defaultLab = entity.LabType{
		Template: defautlTfvar,
	}

	return defaultLab, nil
}
