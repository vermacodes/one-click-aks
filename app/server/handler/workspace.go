package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type WorkspaceHandler struct {
	WorkspaceService entity.WorkspaceService
}

func NewWorkspaceHandler(r *gin.RouterGroup, service entity.WorkspaceService) {
	handler := &WorkspaceHandler{
		WorkspaceService: service,
	}

	r.GET("/workspace", handler.ListWorkspaces)
	r.GET("/resources", handler.GetResources)
}

func (w *WorkspaceHandler) ListWorkspaces(c *gin.Context) {
	workspaces, err := w.WorkspaceService.List()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, workspaces)
}

func (w *WorkspaceHandler) GetResources(c *gin.Context) {
	resources, err := w.WorkspaceService.Resources()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.String(http.StatusOK, resources)
}
