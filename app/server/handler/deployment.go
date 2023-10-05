package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type deploymentHandler struct {
	deploymentService entity.DeploymentService
}

func NewDeploymentHandler(r *gin.RouterGroup, service entity.DeploymentService) {
	handler := &deploymentHandler{
		deploymentService: service,
	}

	//r.GET("/deployments", handler.GetDeployments)
	r.GET("/deployments/:userId", handler.GetMyDeployments)
	r.GET("/deployments/:userId/:workspace", handler.GetDeployment)
	r.POST("/deployments", handler.AddDeployment)
	r.DELETE("/deployments/:userId/:workspace", handler.DeleteDeployment)
}

func (d *deploymentHandler) GetMyDeployments(c *gin.Context) {
	userId := c.Param("userId")
	deployments, err := d.deploymentService.GetMyDeployments(userId)
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

	if err := d.deploymentService.AddDeployment(deployment); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusCreated)
}

func (d *deploymentHandler) DeleteDeployment(c *gin.Context) {
	userId := c.Param("userId")
	workspace := c.Param("workspace")

	if err := d.deploymentService.DeleteDeployment(userId, workspace); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusNoContent)
}
