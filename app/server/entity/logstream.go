package entity

type LogStream struct {
	Logs string `json:"logs"`
}

type LogStreamService interface {
	AppendLogs(logs string) error
	SetLogs(logs string) error
	GetLogs() (LogStream, error)
	ClearLogs() error
	WaitForLogsChange() (LogStream, error)
}

type LogStreamRepository interface {
	SetLogsInRedis(logStream string) error
	GetLogsFromRedis() (string, error)
	WaitForLogsChange() (string, error)
}
