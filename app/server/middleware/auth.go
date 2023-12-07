package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
	"golang.org/x/exp/slog"
)

func AuthRequired(authService entity.AuthService, logStream entity.LogStreamService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the auth token from the request header
		authToken := c.GetHeader("Authorization")

		if authToken == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no auth token provided"})
			return
		}

		isAADToken, err := helper.VerifyToken(authToken)
		if err != nil || !isAADToken {
			slog.Error("invalid auth token", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid auth token" + err.Error()})
			return
		}

		// Remove Bearer from the authToken
		authToken = strings.Split(authToken, "Bearer ")[1]

		if authToken == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no auth token provided"})
			return
		}

		userPrincipal, err := helper.GetUserPrincipalFromMSALAuthToken(authToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid auth token"})
			return
		}

		// ensure user principal matches with the one in env
		if userPrincipal != os.Getenv("ARM_USER_PRINCIPAL_NAME") {
			slog.Error("principal mismatch : token issued to "+userPrincipal+" but found user "+os.Getenv("ARM_USER_PRINCIPAL_NAME"), nil)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "principal mismatch : token issued to " + userPrincipal + " but found user " + os.Getenv("ARM_USER_PRINCIPAL_NAME")})
			return
		}

		loginStatus, err := authService.ServicePrincipalLoginStatus()
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
