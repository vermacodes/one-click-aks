package repository

import "github.com/vermacodes/one-click-aks/app/server/entity"

type logStreamRepository struct{}

func NewLogStreamRepository() entity.LogStreamRepository {
	return &logStreamRepository{}
}

func (l *logStreamRepository) SetLogsInRedis(logStream string) error {
	return setRedis("logs", logStream)
}
func (l *logStreamRepository) GetLogsFromRedis() (string, error) {
	return getRedis("logs")
}
