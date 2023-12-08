package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type logStreamHandler struct {
	logStreamService entity.LogStreamService
}

func NewLogStreamHandler(r *gin.Engine, service entity.LogStreamService) {
	handler := &logStreamHandler{
		logStreamService: service,
	}

	r.GET("/logs", handler.GetLogs)
	r.PUT("/logs", handler.SetLogs)
	r.PUT("/logs/append", handler.AppendLogs)
	r.DELETE("/logs", handler.DeleteLogs)
	r.GET("/logsws", func(c *gin.Context) {
		handler.GetLogsWs(c.Writer, c.Request)
	})
}

func (l *logStreamHandler) GetLogs(c *gin.Context) {
	logStream, err := l.logStreamService.GetLogs()
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}

	c.IndentedJSON(http.StatusOK, logStream)
}

func (l *logStreamHandler) AppendLogs(c *gin.Context) {
	var logs string
	if err := c.Bind(&logs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := l.logStreamService.AppendLogs(logs); err != nil {
		c.Status(http.StatusNotFound)
		return
	}

	c.Status(http.StatusOK)
}

func (l *logStreamHandler) DeleteLogs(c *gin.Context) {
	if err := l.logStreamService.ClearLogs(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (l *logStreamHandler) SetLogs(c *gin.Context) {
	logStream := entity.LogStream{}
	if err := c.Bind(&logStream); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	l.logStreamService.SetLogs(logStream.Logs)
	c.Status(http.StatusOK)
}

var logStreamUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (l *logStreamHandler) GetLogsWs(w http.ResponseWriter, r *http.Request) {
	ws, err := logStreamUpgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("failed to upgrade log stream web socket connection", err)
		return
	}
	defer ws.Close()

	// Get initial logs
	initialLogs, err := l.logStreamService.GetLogs()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("failed to retrieve initial logs", err)
		return
	}

	// Send initial logs
	if err := ws.WriteJSON(initialLogs); err != nil {
		slog.Error("failed to write initial logs to websocket", err)
		return
	}

	for {
		logStream, err := l.logStreamService.WaitForLogsChange()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			slog.Error("failed to wait for logs change", err)
			return
		}

		if err := ws.WriteJSON(logStream); err != nil {
			slog.Error("failed to write logs to websocket", err)
			return
		}
	}
}
