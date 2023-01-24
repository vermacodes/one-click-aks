package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
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
