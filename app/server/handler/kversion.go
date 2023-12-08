package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type kVerisonHandler struct {
	kVersionService entity.KVersionService
}

func NewKVersionHandler(r *gin.RouterGroup, service entity.KVersionService) {
	handler := &kVerisonHandler{
		kVersionService: service,
	}

	r.GET("/kubernetesorchestrators", handler.GetOrchestrator)
	r.GET("/kubernetesdefaultversion", handler.GetDefaultVersion)
}

func (k *kVerisonHandler) GetOrchestrator(c *gin.Context) {
	kubernetesOrchestrator, err := k.kVersionService.GetOrchestrator()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, kubernetesOrchestrator)
}

// Default Kubernetes Version
func (k *kVerisonHandler) GetDefaultVersion(c *gin.Context) {
	defaultVersion := k.kVersionService.GetDefaultVersion()
	if defaultVersion == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "not able to get default version"})
		return
	}

	c.IndentedJSON(http.StatusOK, defaultVersion)
}
