package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type authHandler struct {
	authService entity.AuthService
}

func NewAuthHandler(r *gin.Engine, service entity.AuthService) {
	handler := &authHandler{
		authService: service,
	}

	r.POST("/login", handler.Login)
	r.GET("/login", handler.GetLoginStatus)
	r.GET("/account", handler.GetAccount)
	r.GET("/accounts", handler.GetAccounts)
	r.PUT("/account", handler.SetAccount)
	r.GET("/privilege", handler.GetPrivileges)
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

func (a *authHandler) GetLoginStatus(c *gin.Context) {
	loginStatus, err := a.authService.GetLoginStatus()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, loginStatus)
}

func (a *authHandler) GetAccount(c *gin.Context) {
	account, err := a.authService.GetAccount()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, account)
}

func (a *authHandler) GetAccounts(c *gin.Context) {
	accounts, err := a.authService.GetAccounts()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, accounts)
}

func (a *authHandler) SetAccount(c *gin.Context) {
	account := entity.Account{}
	if err := c.BindJSON(&account); err != nil {
		slog.Error("not able to bind payload to Account in SetAccount ", err)
		c.Status(http.StatusBadRequest)
		return
	}

	if err := a.authService.SetAccount(account); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusOK)
}

func (a *authHandler) GetPrivileges(c *gin.Context) {
	privilege, err := a.authService.GetPriveledges()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, privilege)
}
