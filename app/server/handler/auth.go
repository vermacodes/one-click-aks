package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type authHandler struct {
	authService entity.AuthService
}

func NewAuthHandler(r *gin.Engine, service entity.AuthService) {
	handler := &authHandler{
		authService: service,
	}

	r.POST("/login", handler.Login)
}

func (a *authHandler) Login(c *gin.Context) {
	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()
	a.authService.Login()
}
