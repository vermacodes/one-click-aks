package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type preferenceHandler struct {
	preferenceService entity.PreferenceService
}

func NewPreferenceHandler(r *gin.RouterGroup, preferenceService entity.PreferenceService) {
	handler := &preferenceHandler{
		preferenceService: preferenceService,
	}

	r.GET("/preference", handler.GetPreference)
	r.PUT("/preference", handler.SetPreference)
}

func (p *preferenceHandler) GetPreference(c *gin.Context) {
	preference, err := p.preferenceService.GetPreference()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, preference)
}

func (p *preferenceHandler) SetPreference(c *gin.Context) {
	preference := entity.Preference{}
	if err := c.BindJSON(&preference); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := p.preferenceService.SetPreference(preference); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}
