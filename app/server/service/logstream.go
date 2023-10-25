package service

import (
	"encoding/base64"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type logStreamService struct {
	logStreamRepository entity.LogStreamRepository
}

func NewLogStreamService(logStreamRepository entity.LogStreamRepository) entity.LogStreamService {
	return &logStreamService{
		logStreamRepository: logStreamRepository,
	}
}

// Appends to already set logs in redis.
func (l *logStreamService) AppendLogs(logs string) error {
	logStream, err := l.GetLogs()
	if err != nil {
		slog.Debug("not able to get logs from redis. setting new")
		logStream.Logs = ""
	}

	logStream.Logs += logs

	return l.SetLogs(logStream.Logs)
}

func (l *logStreamService) ClearLogs() error {
	return l.SetLogs("")
}

// sets the logs in redis.
func (l *logStreamService) SetLogs(logs string) error {
	// this is a hack to continue the logs from where they are right now.
	if logs == "continue" {
		prevLogStream, err := l.GetLogs()
		if err != nil {
			logs = ""
		} else {
			logs = prevLogStream.Logs
		}
	}

	// encode the logs string and store it in redis.
	encodedLogs := base64.StdEncoding.EncodeToString([]byte(logs))
	return l.logStreamRepository.SetLogsInRedis(encodedLogs)
}

// gets the logs from redis and returns the object.
func (l *logStreamService) GetLogs() (entity.LogStream, error) {
	encodedLogs, err := l.logStreamRepository.GetLogsFromRedis()
	if err != nil {
		slog.Info("not able to get logs from redis")

		// Default to empty.
		defaultLogStream := entity.LogStream{
			Logs: "",
		}

		if err := l.SetLogs(""); err != nil {
			slog.Error("not able to set default log stream", err)
			return defaultLogStream, err
		}

		return defaultLogStream, nil
	}

	// decode the logs string and return the object.
	return helperEncodedStringToLogStreamObject(encodedLogs)
}

// waits for the logs to change and returns the new logs.
func (l *logStreamService) WaitForLogsChange() (entity.LogStream, error) {
	logsString, err := l.logStreamRepository.WaitForLogsChange()
	if err != nil {
		return entity.LogStream{}, err
	}

	return helperEncodedStringToLogStreamObject(logsString)
}

// decodes the encoded string and returns the object.
func helperEncodedStringToLogStreamObject(encodedLogs string) (entity.LogStream, error) {
	logBytes, err := base64.StdEncoding.DecodeString(encodedLogs)
	if err != nil {
		slog.Error("not able to decode logs", err)
		return entity.LogStream{}, err
	}

	logs := string(logBytes)
	logStream := entity.LogStream{
		Logs: logs,
	}

	return logStream, nil
}
