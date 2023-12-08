package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type labHandler struct {
	labService entity.LabService
}

func NewLabHandler(r *gin.RouterGroup, labService entity.LabService) {
	handler := &labHandler{
		labService: labService,
	}
	r.GET("/lab", handler.GetLabFromRedis)
	r.PUT("/lab", handler.SetLabInRedis)
	r.DELETE("/lab/redis", handler.DeleteLabFromRedis)
	r.POST("/lab", handler.AddMyLab)
	r.DELETE("/lab", handler.DeleteMyLab)
	r.GET("/lab/my", handler.GetMyLabs)
}

func (l *labHandler) GetLabFromRedis(c *gin.Context) {
	lab, err := l.labService.GetLabFromRedis()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, lab)
}

func (l *labHandler) SetLabInRedis(c *gin.Context) {
	lab := entity.LabType{}

	if err := c.Bind(&lab); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := l.labService.SetLabInRedis(lab); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (l *labHandler) DeleteLabFromRedis(c *gin.Context) {
	if err := l.labService.DeleteLabFromRedis(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (l *labHandler) GetMyLabs(c *gin.Context) {
	labs, err := l.labService.GetMyLabs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, labs)
}

func (l *labHandler) AddMyLab(c *gin.Context) {
	lab := entity.LabType{}
	if err := c.Bind(&lab); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := l.labService.AddMyLab(lab); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusCreated)
}

func (l *labHandler) DeleteMyLab(c *gin.Context) {
	lab := entity.LabType{}
	if err := c.Bind(&lab); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := l.labService.DeleteMyLab(lab); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
