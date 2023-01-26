package service

import "github.com/vermacodes/one-click-aks/app/server/entity"

type loggingService struct {
	loggingRespository entity.LoggingRespoitory
}

func NewLoggingService(loggingRespository entity.LoggingRespoitory) entity.LoggingService {
	return &loggingService{
		loggingRespository: loggingRespository,
	}
}

func (l *loggingService) LoginRecord(user entity.User) error {
	return l.loggingRespository.LoginRecord(user)
}

func (l *loggingService) PlanRecord(user entity.User, lab entity.LabType) error {
	return l.loggingRespository.PlanRecord(user, lab)
}

func (l *loggingService) DeploymentRecord(user entity.User, lab entity.LabType) error {
	return l.loggingRespository.DeploymentRecord(user, lab)
}
