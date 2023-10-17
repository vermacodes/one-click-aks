package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type actionStatusHandler struct {
	actionStatusService entity.ActionStatusService
}

func NewActionStatusHanlder(r *gin.Engine, service entity.ActionStatusService) {
	handler := &actionStatusHandler{
		actionStatusService: service,
	}

	r.GET("/actionstatus", handler.GetActionStatus)
	r.PUT("/actionstatus", handler.SetActionStatus)
	r.GET("/terraformoperation/:id", handler.GetTerraformOperationStatus)
	r.GET("/actionstatusws", func(c *gin.Context) {
		handler.GetActionStatusWs(c.Writer, c.Request)
	})
}

func (a *actionStatusHandler) GetActionStatus(c *gin.Context) {
	actionStatus, err := a.actionStatusService.GetActionStatus()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, actionStatus)
}

func (a *actionStatusHandler) SetActionStatus(c *gin.Context) {
	actionStatus := entity.ActionStatus{}
	if err := c.Bind(&actionStatus); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	a.actionStatusService.SetActionStatus(actionStatus)
	c.Status(http.StatusOK)
}

func (a *actionStatusHandler) GetTerraformOperationStatus(c *gin.Context) {
	terraformOperationId := c.Param("id")
	terraformOperation, err := a.actionStatusService.GetTerraformOperation(terraformOperationId)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, terraformOperation)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (a *actionStatusHandler) GetActionStatusWs(w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("not able to upgrade connection", err)
		return
	}

	for {
		actionStatus, err := a.actionStatusService.GetActionStatus()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		slog.Info("sending action status to client: ", actionStatus.InProgress)

		if err := conn.WriteJSON(actionStatus); err != nil {
			return
		}

		time.Sleep(5 * time.Second)
	}
}
