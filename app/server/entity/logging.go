package entity

import "github.com/Azure/azure-sdk-for-go/sdk/data/aztables"

type LoginRecord struct {
	aztables.Entity
}

type PlanRecord struct {
	aztables.Entity
	Lab string
}

type DeploymentRecord struct {
	aztables.Entity
	Lab string
}

type LoggingService interface {
	LoginRecord(user User) error
	PlanRecord(user User, lab LabType) error
	DeploymentRecord(user User, lab LabType) error
}

type LoggingRepository interface {
	LoginRecord(user User) error
	PlanRecord(user User, lab LabType) error
	DeploymentRecord(user User, lab LabType) error
}
