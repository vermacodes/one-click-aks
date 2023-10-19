package service

import (
	"encoding/base64"
	"encoding/json"
	"fmt"

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

func (l *logStreamService) AppendLogs(logs string) error {
	logStream := entity.LogStream{}
	logStream, err := l.GetLogs()
	if err != nil {
		slog.Debug("not able to get logs from redis. setting new")
		logStream.Logs = ""
	}

	logStream.Logs += logs

	if err := l.SetLogs(logStream); err != nil {
		return err
	}

	return nil
}

func (l *logStreamService) ClearLogs() error {

	defaultLogStream := entity.LogStream{
		IsStreaming: false,
		Logs:        "",
	}

	if err := l.SetLogs(defaultLogStream); err != nil {
		return err
	}

	return nil
}

func (l *logStreamService) SetLogs(logStream entity.LogStream) error {

	// this is a hack to continue the logs from where they are right now.
	if logStream.Logs == "continue" {
		prevLogStream, err := l.GetLogs()
		if err != nil {
			logStream.Logs = ""
		} else {
			logStream.Logs = prevLogStream.Logs
		}
	}

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

		// Default to empty.
		defaultLogStream := entity.LogStream{
			IsStreaming: false,
			Logs:        "",
		}

		if err := l.SetLogs(defaultLogStream); err != nil {
			slog.Error("not able to set defualt log stream", err)
		}

		return defaultLogStream, nil
	}

	logStream, err := helperStringToLogStream(logStreamString)
	if err != nil {
		return logStream, err
	}

	return logStream, nil
}

func (l *logStreamService) StartLogStream() {
	slog.Debug("starting log stream")
	logStream, err := l.GetLogs()
	if err != nil {
		slog.Error("not able to get current logs", err)
		return
	}
	logStream.IsStreaming = true // Setting streaming to true.
	l.SetLogs(logStream)
}

func (l *logStreamService) EndLogStream() {
	slog.Debug("ending log stream")
	logStream, err := l.GetLogs()
	if err != nil {
		slog.Error("not able to get current logs", err)
		return
	}
	logStream.IsStreaming = false                                // Setting streaming to false.
	logStream.Logs = logStream.Logs + fmt.Sprintf("%s\n", "end") // Appening 'end' to signal stream end.
	l.SetLogs(logStream)

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
