package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

func AuthRequired(authService entity.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		loginStatus, err := authService.GetLoginStatus()
		if err != nil {
			slog.Error("not able to get auth status", err)
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if !loginStatus.IsLoggedIn {
			slog.Info("authentication required")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Next()
	}
}
