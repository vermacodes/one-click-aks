package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type WorkspaceHandler struct {
	WorkspaceService entity.WorkspaceService
}

func NewWorkspaceHandler(r *gin.RouterGroup, service entity.WorkspaceService) {
	handler := &WorkspaceHandler{
		WorkspaceService: service,
	}

	r.GET("/workspace", handler.ListWorkspaces)
	r.POST("/workspace", handler.AddWorkspace)
	r.PUT("/workspace", handler.SelectWorkspace)
	r.DELETE("/workspace", handler.DeleteWorkspace)
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

func (w *WorkspaceHandler) AddWorkspace(c *gin.Context) {
	workspace := entity.Workspace{}

	if err := c.BindJSON(&workspace); err != nil {
		slog.Error("not able to bind the payload to object", err)
		c.Status(http.StatusBadRequest)
		return
	}

	if err := w.WorkspaceService.Add(workspace); err != nil {
		slog.Error("not abel to add workspace", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.Status(http.StatusCreated)
}

func (w *WorkspaceHandler) SelectWorkspace(c *gin.Context) {
	workspace := entity.Workspace{}

	if err := c.BindJSON(&workspace); err != nil {
		slog.Error("not able to bind the payload to object", err)
		c.Status(http.StatusBadRequest)
		return
	}

	if err := w.WorkspaceService.Select(workspace); err != nil {
		slog.Error("not abel to select workspace", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.Status(http.StatusOK)
}

func (w *WorkspaceHandler) DeleteWorkspace(c *gin.Context) {
	workspace := entity.Workspace{}

	if err := c.BindJSON(&workspace); err != nil {
		slog.Error("not able to bind the payload to object", err)
		c.Status(http.StatusBadRequest)
		return
	}

	if err := w.WorkspaceService.Delete(workspace); err != nil {
		slog.Error("not abel to delete workspace", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.Status(http.StatusNoContent)
}

func (w *WorkspaceHandler) GetResources(c *gin.Context) {
	resources, err := w.WorkspaceService.Resources()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.String(http.StatusOK, resources)
}
