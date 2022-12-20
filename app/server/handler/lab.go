package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type labHandler struct {
	labService entity.LabService
}

func NewLabHandler(r *gin.Engine, labService entity.LabService) {
	handler := &labHandler{
		labService: labService,
	}

	r.POST("/plan", handler.Plan)
	r.GET("/lab", handler.GetLabFromRedis)
	r.PUT("/lab", handler.SetLabInRedis)
}

func (l *labHandler) GetLabFromRedis(c *gin.Context) {
	lab, err := l.labService.GetLabFromRedis()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, lab)
}

func (l *labHandler) SetLabInRedis(c *gin.Context) {
	lab := entity.LabType{}

	if err := c.Bind(&lab); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	if err := l.labService.SetLabInRedis(lab); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusOK)
}

func (l *labHandler) Plan(c *gin.Context) {
	lab := entity.LabType{}
	if err := c.Bind(&lab); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	l.labService.Plan(lab)
}
