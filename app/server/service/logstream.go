package service

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"

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

func (l *logStreamService) SetLogs(logStream entity.LogStream) error {
	logStreamString, err := helperLogStreamToString(logStream)
	if err != nil {
		return err
	}
	l.logStreamRepository.SetLogsInRedis(logStreamString)

	return nil
}

func (l *logStreamService) GetLogs() (entity.LogStream, error) {
	logStreamString, err := l.logStreamRepository.GetLogsFromRedis()
	if err != nil {
		slog.Error("not able to get logs from redis", err)
	}

	logStream, err := helperStringToLogStream(logStreamString)
	if err != nil {
		return logStream, err
	}

	return logStream, nil
}

func (l *logStreamService) EndLogStream() {
	slog.Info("ending log stream in 5 seconds")

	go func() {
		time.Sleep(5 * time.Second)
		logStream, err := l.GetLogs()
		if err != nil {
			slog.Error("not able to get current logs", err)
			return
		}
		logStream.IsStreaming = false                                // Setting streaming to false.
		logStream.Logs = logStream.Logs + fmt.Sprintf("%s\n", "end") // Appening 'end' to signal stream end.
		l.SetLogs(logStream)
	}()
}

// Encodes the Logs and conver object to sting.
func helperLogStreamToString(logStream entity.LogStream) (string, error) {
	logStream.Logs = base64.StdEncoding.EncodeToString([]byte(string(logStream.Logs)))
	val, err := json.Marshal(logStream)
	if err != nil {
		slog.Error("not able to convert log stream object to string", err)
	}
	return string(val), err
}

// Convert the string to object and decode the Logs.
func helperStringToLogStream(logStreamString string) (entity.LogStream, error) {
	logStream := entity.LogStream{}
	if err := json.Unmarshal([]byte(logStreamString), &logStream); err != nil {
		slog.Error("not able to convert string to log stream object", err)
		return logStream, err
	}

	decodedLogs, err := base64.StdEncoding.DecodeString(logStream.Logs)
	if err != nil {
		slog.Error("not able to decode logs ", err)
	}

	logStream.Logs = string(decodedLogs)
	return logStream, nil
}
