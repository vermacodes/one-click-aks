package repository

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
	"golang.org/x/exp/slog"
)

type deploymentRepository struct{}

func NewDeploymentRepository() entity.DeploymentRepository {
	return &deploymentRepository{}
}

func (d *deploymentRepository) GetDeployments() ([]entity.Deployment, error) {
	return nil, nil
}

func (d *deploymentRepository) GetMyDeployments(userId string, subscriptionId string) ([]entity.Deployment, error) {

	deployment := entity.Deployment{}
	deployments := []entity.Deployment{}
	client := helper.GetServiceClient().NewClient("Deployments")
	filter := "PartitionKey eq '" + userId + "'"

	pager := client.NewListEntitiesPager(&aztables.ListEntitiesOptions{Filter: &filter})
	pageCount := 1

	for pager.More() {
		response, err := pager.NextPage(context.TODO())
		if err != nil {
			slog.Error("error getting deployments ", err)
			return nil, err
		}

		for _, entity := range response.Entities {
			var myEntity aztables.EDMEntity
			err := json.Unmarshal(entity, &myEntity)
			if err != nil {
				slog.Error("error unmarshal deployment entity ", err)
				return nil, err
			}

			// filter out deployments that are not for the current subscription
			// check if RowKey contains the subscriptionId
			if !strings.Contains(myEntity.RowKey, subscriptionId) {
				continue
			}

			deploymentString := myEntity.Properties["Deployment"].(string)
			if err := json.Unmarshal([]byte(deploymentString), &deployment); err != nil {
				slog.Error("error unmarshal deployment ", err)
				return nil, err
			}

			deployments = append(deployments, deployment)
		}

		pageCount++
	}

	return deployments, nil
}

func (d *deploymentRepository) GetDeployment(userId string, workspace string, subscriptionId string) (entity.Deployment, error) {
	client := helper.GetServiceClient().NewClient("Deployments")

	response, err := client.GetEntity(context.TODO(), userId, userId+"-"+workspace+"-"+subscriptionId, nil)
	if err != nil {
		slog.Error("error getting deployment ", err)
		return entity.Deployment{}, err
	}

	var myEntity aztables.EDMEntity
	err = json.Unmarshal(response.Value, &myEntity)
	if err != nil {
		slog.Error("error unmarshal deployment entity ", err)
		return entity.Deployment{}, err
	}

	deploymentString := myEntity.Properties["Deployment"].(string)
	deployment := entity.Deployment{}
	if err := json.Unmarshal([]byte(deploymentString), &deployment); err != nil {
		slog.Error("error unmarshal deployment ", err)
		return entity.Deployment{}, err
	}

	return deployment, nil
}

func (d *deploymentRepository) UpsertDeployment(deployment entity.Deployment) error {
	client := helper.GetServiceClient().NewClient("Deployments")

	marshalledDeployment, err := json.Marshal(deployment)
	if err != nil {
		slog.Error("error occurred marshalling the deployment record.", err)
		return err
	}

	deploymentEntry := entity.DeploymentEntry{
		Entity: aztables.Entity{
			PartitionKey: deployment.DeploymentUserId,
			RowKey:       deployment.DeploymentId,
		},
		Deployment: string(marshalledDeployment),
	}

	marshalled, err := json.Marshal(deploymentEntry)
	if err != nil {
		slog.Error("error occurred marshalling the deployment record.", err)
		return err
	}

	slog.Debug("updating deployment record ", "deployment", string(marshalled))

	_, err = client.UpsertEntity(context.TODO(), marshalled, nil)
	if err != nil {
		slog.Error("error adding deployment record ", err)
		return err
	}

	return nil
}

func (d *deploymentRepository) DeploymentOperationEntry(deployment entity.Deployment) error {
	client := helper.GetServiceClient().NewClient("DeploymentOperations")

	marshalledDeploymentLab, err := json.Marshal(deployment.DeploymentLab)
	if err != nil {
		slog.Error("error occurred marshalling the deployment lab.", err)
		return err
	}

	slog.Debug("adding record for " + deployment.DeploymentUserId)

	operationEntry := entity.OperationEntry{
		PartitionKey:                 deployment.DeploymentUserId,
		RowKey:                       helper.Generate(64),
		DeploymentUserId:             deployment.DeploymentUserId,
		DeploymentSubscriptionId:     deployment.DeploymentSubscriptionId,
		DeploymentWorkspace:          deployment.DeploymentWorkspace,
		DeploymentStatus:             deployment.DeploymentStatus,
		DeploymentAutoDelete:         deployment.DeploymentAutoDelete,
		DeploymentLifespan:           deployment.DeploymentLifespan,
		DeploymentAutoDeleteUnixTime: deployment.DeploymentAutoDeleteUnixTime,
		DeploymentLab:                string(marshalledDeploymentLab),
	}

	marshalled, err := json.Marshal(operationEntry)
	if err != nil {
		slog.Error("error occurred marshalling the deployment entry record.", err)
		return err
	}

	slog.Debug("updating deployment entry record ", "deployment", string(marshalled))

	_, err = client.UpsertEntity(context.TODO(), marshalled, nil)
	if err != nil {
		slog.Error("error adding deployment entry record ", err)
		return err
	}

	return nil
}

func (d *deploymentRepository) DeleteDeployment(userId string, workspace string, subscriptionId string) error {
	client := helper.GetServiceClient().NewClient("Deployments")

	_, err := client.DeleteEntity(context.TODO(), userId, userId+"-"+workspace+"-"+subscriptionId, nil)
	if err != nil {
		slog.Error("error deleting deployment record ", err)
		return err
	}

	return nil
}
