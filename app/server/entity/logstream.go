package entity

type LogStream struct {
	IsStreaming bool   `json:"isStreaming"`
	Logs        string `json:"logs"`
}

type LogStreamService interface {
	SetLogs(logStream LogStream) error
	GetLogs() (LogStream, error)
	EndLogStream()
}

type LogStreamRepository interface {
	SetLogsInRedis(logStream string) error
	GetLogsFromRedis() (string, error)
}
