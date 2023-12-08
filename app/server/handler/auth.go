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

func NewLoginHandler(r *gin.Engine, service entity.AuthService) {
	handler := &authHandler{
		authService: service,
	}
	r.POST("/service-principal-login", handler.ServicePrincipalLogin)
}

func NewAuthHandler(r *gin.RouterGroup, service entity.AuthService) {
	handler := &authHandler{
		authService: service,
	}

	r.GET("/service-principal-login", handler.ServicePrincipalLogin)
	r.GET("/accounts", handler.GetAccounts)
}

func NewAuthWithActionStatusHandler(r *gin.RouterGroup, service entity.AuthService) {
	handler := &authHandler{
		authService: service,
	}
	r.PUT("/account", handler.SetAccount)
}

func (a *authHandler) ServicePrincipalLogin(c *gin.Context) {
	LoginStatus, err := a.authService.ServicePrincipalLogin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, LoginStatus)
}

func (a *authHandler) ServicePrincipalLoginStatus(c *gin.Context) {
	LoginStatus, err := a.authService.ServicePrincipalLoginStatus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, LoginStatus)
}

func (a *authHandler) GetAccounts(c *gin.Context) {
	accounts, err := a.authService.GetAccounts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, accounts)
}

func (a *authHandler) SetAccount(c *gin.Context) {
	account := entity.Account{}
	if err := c.BindJSON(&account); err != nil {
		slog.Error("not able to bind payload to Account in SetAccount ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := a.authService.SetAccount(account); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}
