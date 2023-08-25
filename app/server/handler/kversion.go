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
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, kubernetesOrchestrator)
}

// Default Kubernetes Version
func (k *kVerisonHandler) GetDefaultVersion(c *gin.Context) {
	defaultVersion := k.kVersionService.GetDefaultVersion()
	if defaultVersion == "" {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, defaultVersion)
}
