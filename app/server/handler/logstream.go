package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
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
	r.PUT("/logs/endstream", handler.EndLogStream)
}

func (l *logStreamHandler) GetLogs(c *gin.Context) {
	logStream, err := l.logStreamService.GetLogs()
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}

	c.IndentedJSON(http.StatusOK, logStream)
}

func (l *logStreamHandler) SetLogs(c *gin.Context) {
	logStream := entity.LogStream{}
	if err := c.Bind(&logStream); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	l.logStreamService.SetLogs(logStream)
	c.Status(http.StatusOK)
}

func (l *logStreamHandler) EndLogStream(c *gin.Context) {
	l.logStreamService.EndLogStream()
	c.Status(http.StatusOK)
}
