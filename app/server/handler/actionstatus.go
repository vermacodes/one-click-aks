package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type actionStatusHandler struct {
	actionStatusService entity.ActionStatusService
}

func NewActionStatusHandler(r *gin.Engine, service entity.ActionStatusService) {
	handler := &actionStatusHandler{
		actionStatusService: service,
	}

	r.GET("/actionstatus", handler.GetActionStatus)
	r.PUT("/actionstatus", handler.SetActionStatus)
	r.GET("/terraform/status", handler.GetTerraformOperationStatus)
	r.GET("/terraform/statusws", func(c *gin.Context) {
		handler.GetTerraformOperationWs(c.Writer, c.Request)
	})
	r.GET("/actionstatusws", func(c *gin.Context) {
		handler.GetActionStatusWs(c.Writer, c.Request)
	})

	r.GET("/serverNotificationWs", func(c *gin.Context) {
		handler.GetServerNotificationWs(c.Writer, c.Request)
	})
}

func NewAuthActionStatusHandler(r *gin.RouterGroup, service entity.ActionStatusService) {
	handler := &actionStatusHandler{
		actionStatusService: service,
	}
	r.GET("/secureServerNotificationWs", func(c *gin.Context) {
		handler.GetServerNotificationWs(c.Writer, c.Request)
	})
}

func (a *actionStatusHandler) GetActionStatus(c *gin.Context) {
	actionStatus, err := a.actionStatusService.GetActionStatus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, actionStatus)
}

func (a *actionStatusHandler) SetActionStatus(c *gin.Context) {
	actionStatus := entity.ActionStatus{}
	if err := c.Bind(&actionStatus); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	a.actionStatusService.SetActionStatus(actionStatus)
	c.Status(http.StatusOK)
}

func (a *actionStatusHandler) GetTerraformOperationStatus(c *gin.Context) {
	terraformOperation, err := a.actionStatusService.GetTerraformOperation()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, terraformOperation)
}

var actionStatusUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (a *actionStatusHandler) GetActionStatusWs(w http.ResponseWriter, r *http.Request) {
	conn, err := actionStatusUpgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("Failed to upgrade action status websocket connection:", err)
		return
	}

	defer conn.Close()

	// Get initial action status
	initialActionStatus, err := a.actionStatusService.GetActionStatus()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("Failed to retrieve initial action status:", err)
		return
	}

	// Send the initial action status to the client
	if err := conn.WriteJSON(initialActionStatus); err != nil {
		slog.Error("Failed to send initial action status to client:", err)
		return
	}

	// previousActionStatus := initialActionStatus

	for {
		// Get the current action status
		actionStatus, err := a.actionStatusService.WaitForActionStatusChange()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			slog.Error("Failed to retrieve action status:", err)
			return
		}

		// Check for changes in action status
		if err := conn.WriteJSON(actionStatus); err != nil {
			slog.Error("Failed to send action status to client:", err)
			return
		}

	}
}

func (a *actionStatusHandler) GetTerraformOperationWs(w http.ResponseWriter, r *http.Request) {
	conn, err := actionStatusUpgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("Failed to upgrade action status websocket connection:", err)
		return
	}

	defer conn.Close()

	for {
		// Get the current action status
		actionStatus, err := a.actionStatusService.WaitForTerraformOperationChange()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			slog.Error("Failed to retrieve action status:", err)
			return
		}

		// Check for changes in action status
		if err := conn.WriteJSON(actionStatus); err != nil {
			slog.Error("Failed to send action status to client:", err)
			return
		}
	}
}

func (a *actionStatusHandler) GetServerNotificationWs(w http.ResponseWriter, r *http.Request) {
	conn, err := actionStatusUpgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("Failed to upgrade server notification websocket connection:", err)
		return
	}

	defer conn.Close()

	for {
		// Get the current server notification
		actionStatus, err := a.actionStatusService.WaitForServerNotificationChange()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			slog.Error("Failed to retrieve server notification:", err)
			return
		}

		// Check for changes in server notification
		if err := conn.WriteJSON(actionStatus); err != nil {
			slog.Error("Failed to send server notification to client:", err)
			return
		}
	}
}
