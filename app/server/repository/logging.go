package repository

import (
	"context"
	"encoding/json"

	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
	"golang.org/x/exp/slog"
)

type loggingRepository struct{}

func NewLoggingRepository() entity.LoggingRepository {
	return &loggingRepository{}
}

func getServiceClient() *aztables.ServiceClient {
	SasUrl := "https://" + entity.StorageAccountName + ".table.core.windows.net/" + entity.SasToken
	serviceClient, err := aztables.NewServiceClientWithNoCredential(SasUrl, nil)
	if err != nil {
		slog.Error("error get client", err)
	}

	return serviceClient
}

func (l *loggingRepository) LoginRecord(user entity.User) error {
	client := getServiceClient().NewClient("LoginRecords")

	loginRecord := entity.LoginRecord{
		Entity: aztables.Entity{
			PartitionKey: user.Name,
			RowKey:       helper.Generate(32),
		},
	}

	marshalled, err := json.Marshal(loginRecord)
	if err != nil {
		slog.Error("error occurred marshalling the login record.", err)
		return err
	}

	_, err = client.AddEntity(context.TODO(), marshalled, nil)
	if err != nil {
		slog.Error("error adding login record ", err)
		return err
	}

	return nil
}

func (l *loggingRepository) PlanRecord(user entity.User, lab entity.LabType) error {

	client := getServiceClient().NewClient("Plans")

	marshalledLab, err := json.Marshal(lab)
	if err != nil {
		slog.Error("unable to marshal lab", err)
		return err
	}

	planRecord := entity.PlanRecord{
		Entity: aztables.Entity{
			PartitionKey: user.Name,
			RowKey:       helper.Generate(32),
		},
		Lab: string(marshalledLab),
	}

	marshalled, err := json.Marshal(planRecord)
	if err != nil {
		slog.Error("error occurred marshalling the plan record.", err)
		return err
	}

	_, err = client.AddEntity(context.TODO(), marshalled, nil)
	if err != nil {
		slog.Error("error adding plan record ", err)
		return err
	}

	return nil
}

func (l *loggingRepository) DeploymentRecord(user entity.User, lab entity.LabType) error {

	client := getServiceClient().NewClient("Deployments")

	marshalledLab, err := json.Marshal(lab)
	if err != nil {
		slog.Error("unable to marshal lab", err)
		return err
	}

	deploymentRecord := entity.DeploymentRecord{
		Entity: aztables.Entity{
			PartitionKey: user.Name,
			RowKey:       helper.Generate(32),
		},
		Lab: string(marshalledLab),
	}

	marshalled, err := json.Marshal(deploymentRecord)
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
