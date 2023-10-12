package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
)

type deploymentHandler struct {
	deploymentService entity.DeploymentService
}

func NewDeploymentHandler(r *gin.RouterGroup, service entity.DeploymentService) {
	handler := &deploymentHandler{
		deploymentService: service,
	}

	//r.GET("/deployments", handler.GetDeployments)
	r.GET("/deployments/my", handler.GetMyDeployments)
	r.GET("/deployments/:workspace", handler.GetDeployment)
	r.POST("/deployments", handler.AddDeployment)
	r.PUT("/deployments", handler.UpdateDeployment)
	r.DELETE("/deployments/:workspace", handler.DeleteDeployment)
}

func (d *deploymentHandler) GetMyDeployments(c *gin.Context) {
	// Get auth token from authorization header to get userPrincipal
	authToken := c.GetHeader("Authorization")
	authToken = strings.Split(authToken, "Bearer ")[1]
	userPrincipal, _ := helper.GetUserPrincipalFromMSALAuthToken(authToken)

	deployments, err := d.deploymentService.GetMyDeployments(userPrincipal)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, deployments)
}

func (d *deploymentHandler) GetDeployment(c *gin.Context) {
	userId := c.Param("userId")
	workspace := c.Param("workspace")
	deployment, err := d.deploymentService.GetDeployment(userId, workspace)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, deployment)
}

func (d *deploymentHandler) AddDeployment(c *gin.Context) {
	deployment := entity.Deployment{}
	if err := c.Bind(&deployment); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// Get auth token from authorization header to get userPrincipal
	authToken := c.GetHeader("Authorization")
	authToken = strings.Split(authToken, "Bearer ")[1]
	userPrincipal, _ := helper.GetUserPrincipalFromMSALAuthToken(authToken)

	deployment.DeploymentId = helper.Generate(5)
	deployment.DeploymentUserId = userPrincipal

	if err := d.deploymentService.AddDeployment(deployment); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusCreated)
}

func (d *deploymentHandler) UpdateDeployment(c *gin.Context) {
	deployment := entity.Deployment{}
	if err := c.Bind(&deployment); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// Get auth token from authorization header to get userPrincipal
	authToken := c.GetHeader("Authorization")
	authToken = strings.Split(authToken, "Bearer ")[1]
	userPrincipal, _ := helper.GetUserPrincipalFromMSALAuthToken(authToken)

	deployment.DeploymentId = helper.Generate(5)
	deployment.DeploymentUserId = userPrincipal

	if err := d.deploymentService.UpdateDeployment(deployment); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusOK)
}

func (d *deploymentHandler) DeleteDeployment(c *gin.Context) {
	workspace := c.Param("workspace")

	// Get auth token from authorization header to get userPrincipal
	authToken := c.GetHeader("Authorization")
	authToken = strings.Split(authToken, "Bearer ")[1]
	userPrincipal, _ := helper.GetUserPrincipalFromMSALAuthToken(authToken)

	if err := d.deploymentService.DeleteDeployment(userPrincipal, workspace); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusNoContent)
}
