package handler

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
	"golang.org/x/exp/slog"
)

type deploymentHandler struct {
	deploymentService   entity.DeploymentService
	terraformService    entity.TerraformService
	actionStatusService entity.ActionStatusService
}

func NewDeploymentHandler(r *gin.RouterGroup,
	service entity.DeploymentService,
	terraformService entity.TerraformService,
	actionStatusService entity.ActionStatusService) {
	handler := &deploymentHandler{
		deploymentService:   service,
		terraformService:    terraformService,
		actionStatusService: actionStatusService,
	}

	//r.GET("/deployments", handler.GetDeployments)
	r.GET("/deployments/my", handler.GetMyDeployments)
	r.GET("/deployments/:workspace", handler.GetDeployment)

	// use this for operations to update in place when action is in progress
	// like update auto destroy and destroy time
	r.PATCH("/deployments", handler.UpsertDeployment)
}

func NewDeploymentWithActionStatusHandler(r *gin.RouterGroup, service entity.DeploymentService,
	terraformService entity.TerraformService,
	actionStatusService entity.ActionStatusService) {
	handler := &deploymentHandler{
		deploymentService:   service,
		terraformService:    terraformService,
		actionStatusService: actionStatusService,
	}

	r.PUT("/deployments", handler.UpsertDeployment)
	r.POST("/deployments", handler.UpsertDeployment)
	r.PUT("/deployments/select", handler.SelectDeployment)
	r.DELETE("/deployments/:workspace/:subscriptionId/:operationId", handler.DeleteDeployment)
}

func (d *deploymentHandler) GetMyDeployments(c *gin.Context) {
	// Get auth token from authorization header to get userPrincipal
	authToken := c.GetHeader("Authorization")
	authToken = strings.Split(authToken, "Bearer ")[1]
	userPrincipal, _ := helper.GetUserPrincipalFromMSALAuthToken(authToken)

	deployments, err := d.deploymentService.GetMyDeployments(userPrincipal)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, deployments)
}

func (d *deploymentHandler) GetDeployment(c *gin.Context) {
	userId := c.Param("userId")
	workspace := c.Param("workspace")
	subscriptionId := c.Param("subscriptionId")
	deployment, err := d.deploymentService.GetDeployment(userId, workspace, subscriptionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, deployment)
}

func (d *deploymentHandler) SelectDeployment(c *gin.Context) {
	deployment := entity.Deployment{}
	if err := c.Bind(&deployment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := d.deploymentService.SelectDeployment(deployment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (d *deploymentHandler) UpsertDeployment(c *gin.Context) {
	deployment := entity.Deployment{}
	if err := c.Bind(&deployment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get auth token from authorization header to get userPrincipal
	authToken := c.GetHeader("Authorization")
	authToken = strings.Split(authToken, "Bearer ")[1]
	userPrincipal, _ := helper.GetUserPrincipalFromMSALAuthToken(authToken)

	deployment.DeploymentId = userPrincipal + "-" + deployment.DeploymentWorkspace + "-" + deployment.DeploymentSubscriptionId
	deployment.DeploymentUserId = userPrincipal

	if err := d.deploymentService.UpsertDeployment(deployment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// This needs to to destroy first. Then delete the deployment
// This will be a long running operation
// Thus implemented like terraform destroy
func (d *deploymentHandler) DeleteDeployment(c *gin.Context) {
	workspace := c.Param("workspace")
	subscriptionId := c.Param("subscriptionId")

	// Get auth token from authorization header to get userPrincipal
	authToken := c.GetHeader("Authorization")
	authToken = strings.Split(authToken, "Bearer ")[1]
	userPrincipal, _ := helper.GetUserPrincipalFromMSALAuthToken(authToken)

	deployment, err := d.deploymentService.GetDeployment(userPrincipal, workspace, subscriptionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	terraformOperation := entity.TerraformOperation{
		OperationId: c.Param("operationId"),
		InProgress:  true,
		Status:      entity.DestroyInProgress,
	}

	fmt.Println(d.actionStatusService)
	fmt.Println(terraformOperation)

	if err := d.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
		slog.Error("error setting terraform operation ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	// Start the long-running operation in a goroutine
	go func() {
		if err := d.actionStatusService.SetActionStart(); err != nil {
			slog.Error("error setting action start ", err)
		}

		if err := d.terraformService.Destroy(deployment.DeploymentLab); err != nil {
			terraformOperation.Status = entity.DestroyFailed
		} else {
			terraformOperation.Status = entity.DestroyCompleted
		}

		terraformOperation.InProgress = false
		if err := d.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
			slog.Error("error setting terraform operation ", err)
		}

		// Delete the deployment
		if err := d.deploymentService.DeleteDeployment(userPrincipal, workspace, subscriptionId); err != nil {
			slog.Error("error deleting deployment ", err)
		}

		if err := d.actionStatusService.SetActionEnd(); err != nil {
			slog.Error("error setting action end ", err)
		}

	}()

	c.Status(http.StatusNoContent)
}
