package service

import "github.com/vermacodes/one-click-aks/app/server/entity"

type loggingService struct {
	loggingRepository entity.LoggingRepository
}

func NewLoggingService(loggingRepository entity.LoggingRepository) entity.LoggingService {
	return &loggingService{
		loggingRepository: loggingRepository,
	}
}

func (l *loggingService) LoginRecord(user entity.User) error {
	return l.loggingRepository.LoginRecord(user)
}

func (l *loggingService) PlanRecord(user entity.User, lab entity.LabType) error {
	return l.loggingRepository.PlanRecord(user, lab)
}

func (l *loggingService) DeploymentRecord(user entity.User, lab entity.LabType) error {
	return l.loggingRepository.DeploymentRecord(user, lab)
}
