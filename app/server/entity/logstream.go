package entity

type LogStream struct {
	IsStreaming bool   `json:"isStreaming"`
	Logs        string `json:"logs"`
}

type LogStreamService interface {
	AppendLogs(stream string) error
	SetLogs(logStream LogStream) error
	GetLogs() (LogStream, error)
	ClearLogs() error
	StartLogStream()
	EndLogStream()
}

type LogStreamRepository interface {
	SetLogsInRedis(logStream string) error
	GetLogsFromRedis() (string, error)
}
