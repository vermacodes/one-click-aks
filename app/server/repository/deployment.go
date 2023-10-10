package repository

import (
	"context"
	"encoding/json"

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

func (d *deploymentRepository) GetMyDeployments(userId string) ([]entity.Deployment, error) {

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
				slog.Error("error unmarshalling deployment entity ", err)
				return nil, err
			}

			deploymentString := myEntity.Properties["Deployment"].(string)
			if err := json.Unmarshal([]byte(deploymentString), &deployment); err != nil {
				slog.Error("error unmarshalling deployment ", err)
				return nil, err
			}

			deployments = append(deployments, deployment)
		}

		pageCount++
	}

	return deployments, nil
}

func (d *deploymentRepository) GetDeployment(userId string, workspace string) (entity.Deployment, error) {
	client := helper.GetServiceClient().NewClient("Deployments")

	response, err := client.GetEntity(context.TODO(), userId, userId+"-"+workspace, nil)
	if err != nil {
		slog.Error("error getting deployment ", err)
		return entity.Deployment{}, err
	}

	var myEntity aztables.EDMEntity
	err = json.Unmarshal(response.Value, &myEntity)
	if err != nil {
		slog.Error("error unmarshalling deployment entity ", err)
		return entity.Deployment{}, err
	}

	deploymentString := myEntity.Properties["Deployment"].(string)
	deployment := entity.Deployment{}
	if err := json.Unmarshal([]byte(deploymentString), &deployment); err != nil {
		slog.Error("error unmarshalling deployment ", err)
		return entity.Deployment{}, err
	}

	return deployment, nil
}

func (d *deploymentRepository) AddDeployment(deployment entity.Deployment) error {
	client := helper.GetServiceClient().NewClient("Deployments")

	marshalledDeployment, err := json.Marshal(deployment)
	if err != nil {
		slog.Error("error occurred marshalling the deployment record.", err)
		return err
	}

	deploymentEntry := entity.DeploymentEntry{
		Entity: aztables.Entity{
			PartitionKey: deployment.DeploymentUserId,
			RowKey:       deployment.DeploymentUserId + "-" + deployment.DeploymentWorkspace,
		},
		Deployment: string(marshalledDeployment),
	}

	marshalled, err := json.Marshal(deploymentEntry)
	if err != nil {
		slog.Error("error occurred marshalling the deployment record.", err)
		return err
	}

	_, err = client.AddEntity(context.TODO(), marshalled, nil)
	if err != nil {
		slog.Error("error adding deployment record ", err)
		return err
	}

	return nil
}

func (d *deploymentRepository) UpdateDeployment(deployment entity.Deployment) error {
	client := helper.GetServiceClient().NewClient("Deployments")

	marshalledDeployment, err := json.Marshal(deployment)
	if err != nil {
		slog.Error("error occurred marshalling the deployment record.", err)
		return err
	}

	deploymentEntry := entity.DeploymentEntry{
		Entity: aztables.Entity{
			PartitionKey: deployment.DeploymentUserId,
			RowKey:       deployment.DeploymentUserId + "-" + deployment.DeploymentWorkspace,
		},
		Deployment: string(marshalledDeployment),
	}

	marshalled, err := json.Marshal(deploymentEntry)
	if err != nil {
		slog.Error("error occurred marshalling the deployment record.", err)
		return err
	}

	_, err = client.UpsertEntity(context.TODO(), marshalled, nil)
	if err != nil {
		slog.Error("error adding deployment record ", err)
		return err
	}

	return nil
}

func (d *deploymentRepository) DeleteDeployment(userId string, workspace string) error {
	client := helper.GetServiceClient().NewClient("Deployments")

	_, err := client.DeleteEntity(context.TODO(), userId, userId+"-"+workspace, nil)
	if err != nil {
		slog.Error("error deleting deployment record ", err)
		return err
	}

	return nil
}
