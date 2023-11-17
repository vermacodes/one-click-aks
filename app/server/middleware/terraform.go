package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

// TerraformMiddleware checks for already running operation and rejects new requests.
func TerraformActionMiddleware(actionStatusService entity.ActionStatusService) gin.HandlerFunc {
	return func(c *gin.Context) {

		actionStatus, err := actionStatusService.GetActionStatus()
		if err != nil {
			slog.Error("not able to get current action status", err)

			// Defaulting to no action
			actionStatus := entity.ActionStatus{
				InProgress: false,
			}
			if err := actionStatusService.SetActionStatus(actionStatus); err != nil {
				slog.Error("not able to set default action status.", err)
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
		}

		if actionStatus.InProgress {
			slog.Info("action in progress")
			c.AbortWithStatus(http.StatusConflict)
			return
		}

		c.Next()
	}
}
