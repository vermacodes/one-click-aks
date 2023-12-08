package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/vermacodes/one-click-aks/app/server/entity"

	"github.com/vermacodes/one-click-aks/app/server/helper"
	"golang.org/x/exp/slog"
)

type terraformHandler struct {
	terraformService    entity.TerraformService
	actionStatusService entity.ActionStatusService
	deploymentService   entity.DeploymentService
}

func NewTerraformWithActionStatusHandler(r *gin.RouterGroup,
	service entity.TerraformService,
	actionStatusService entity.ActionStatusService,
	deploymentService entity.DeploymentService) {
	handler := &terraformHandler{
		terraformService:    service,
		actionStatusService: actionStatusService,
		deploymentService:   deploymentService,
	}

	r.POST("/terraform/init/:operationId", handler.Init)
	r.POST("/terraform/plan/:operationId", handler.Plan)
	r.POST("/terraform/apply/:operationId", handler.Apply)
	r.POST("/terraform/destroy/:operationId", handler.Destroy)
	r.POST("/terraform/extend/:mode/:operationId", handler.Extend)
}

func (t *terraformHandler) Init(c *gin.Context) {
	notification := entity.ServerNotification{
		Id:               uuid.New().String(),
		NotificationType: entity.Info,
		Message:          string(entity.InitInProgress),
		AutoClose:        2000,
	}

	if err := t.actionStatusService.SetServerNotification(notification); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	// Start the long-running operation in a goroutine
	go func() {
		t.actionStatusService.SetActionStart()
		if err := t.terraformService.Init(); err != nil {
			notification.NotificationType = entity.Error
			notification.Message = string(entity.InitFailed)
		} else {
			notification.NotificationType = entity.Success
			notification.Message = string(entity.InitCompleted)
		}
		if err := t.actionStatusService.SetServerNotification(notification); err != nil {
			slog.Error("Error setting server notification", err)
		}
		if err := t.actionStatusService.SetActionEnd(); err != nil {
			slog.Error("Error setting action end", err)
		}
	}()

	// Respond back to the request with the operation ID
	c.IndentedJSON(http.StatusOK, notification)
}

func (t *terraformHandler) Plan(c *gin.Context) {
	deployment := entity.Deployment{}
	if err := c.Bind(&deployment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lab := deployment.DeploymentLab

	notification := entity.ServerNotification{
		Id:               uuid.New().String(),
		NotificationType: entity.Info,
		Message:          string(entity.PlanInProgress),
		AutoClose:        2000,
	}

	if err := t.actionStatusService.SetServerNotification(notification); err != nil {
		slog.Error("Error setting server notification", err)
	}

	// Start the long-running operation in a goroutine
	go func() {
		t.actionStatusService.SetActionStart()
		if err := t.terraformService.Plan(lab); err != nil {
			notification.NotificationType = entity.Error
			notification.Message = string(entity.PlanFailed)
		} else {
			notification.NotificationType = entity.Success
			notification.Message = string(entity.PlanCompleted)
		}
		if err := t.actionStatusService.SetServerNotification(notification); err != nil {
			slog.Error("Error setting server notification", err)
		}
		if err := t.actionStatusService.SetActionEnd(); err != nil {
			slog.Error("Error setting action end", err)
		}
	}()

	// Respond back to the request with the operation ID
	c.Status(http.StatusAccepted)
}

func (t *terraformHandler) Apply(c *gin.Context) {

	deployment := entity.Deployment{}
	if err := c.Bind(&deployment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lab := deployment.DeploymentLab

	notification := entity.ServerNotification{
		Id:               uuid.New().String(),
		NotificationType: entity.Info,
		Message:          string(entity.DeploymentInProgress),
		AutoClose:        2000,
	}

	// Start the long-running operation in a goroutine
	go func() {
		deployment.DeploymentStatus = entity.DeploymentInProgress
		helper.CalculateNewEpochTimeForDeployment(&deployment)
		if err := t.deploymentService.UpsertDeployment(deployment); err != nil {
			slog.Error("Error updating deployment", err)
		}
		t.actionStatusService.SetActionStart()
		if err := t.actionStatusService.SetServerNotification(notification); err != nil {
			slog.Error("Error setting server notification", err)
		}
		if err := t.terraformService.Apply(lab); err != nil {
			notification.NotificationType = entity.Error
			notification.Message = string(entity.DeploymentFailed)
			deployment.DeploymentStatus = entity.DeploymentFailed
		} else {
			notification.NotificationType = entity.Success
			notification.Message = string(entity.DeploymentCompleted)
			deployment.DeploymentStatus = entity.DeploymentCompleted
		}
		if err := t.actionStatusService.SetServerNotification(notification); err != nil {
			slog.Error("Error setting server notification", err)
		}
		helper.CalculateNewEpochTimeForDeployment(&deployment)
		if err := t.deploymentService.UpsertDeployment(deployment); err != nil {
			slog.Error("Error updating deployment", err)
		}
		if err := t.actionStatusService.SetActionEnd(); err != nil {
			slog.Error("Error setting action end", err)
		}
	}()

	// Respond back to the request with the operation ID
	c.Status(http.StatusAccepted)
}

func (t *terraformHandler) Extend(c *gin.Context) {
	mode := c.Param("mode")

	deployment := entity.Deployment{}
	if err := c.Bind(&deployment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lab := deployment.DeploymentLab

	notification := entity.ServerNotification{
		Id:               uuid.New().String(),
		NotificationType: entity.Info,
		Message:          mode + " in progress",
		AutoClose:        2000,
	}

	if err := t.actionStatusService.SetServerNotification(notification); err != nil {
		slog.Error("Error setting server notification", err)
	}

	// Start the long-running operation in a goroutine
	go func() {
		if err := t.actionStatusService.SetActionStart(); err != nil {
			slog.Error("Error setting action start", err)
			notification.NotificationType = entity.Error
			notification.Message = mode + " failed : Not able to update action status."
			return
		}
		if err := t.terraformService.Extend(lab, mode); err != nil {
			notification.NotificationType = entity.Error
			notification.Message = mode + " failed."
		} else {
			notification.NotificationType = entity.Success
			notification.Message = mode + " completed."
		}
		if err := t.actionStatusService.SetServerNotification(notification); err != nil {
			slog.Error("Error setting server notification", err)
		}
		if err := t.actionStatusService.SetActionEnd(); err != nil {
			slog.Error("Error setting action end", err)
		}
	}()

	// Respond back to the request with the operation ID
	c.Status(http.StatusAccepted)
}

// func (t *terraformHandler) Extend(c *gin.Context) {
// 	lab := entity.LabType{}
// 	mode := c.Param("mode")
// 	if err := c.Bind(&lab); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	w := c.Writer
// 	header := w.Header()
// 	header.Set("Transfer-Encoding", "chunked")
// 	header.Set("Content-type", "text/html")

// 	if err := t.terraformService.Extend(lab, mode); err != nil {
// 		w.WriteHeader(http.StatusInternalServerError)
// 	} else {
// 		w.WriteHeader(http.StatusOK)
// 	}

// 	w.(http.Flusher).Flush()
// }

func (t *terraformHandler) Destroy(c *gin.Context) {
	deployment := entity.Deployment{}
	if err := c.Bind(&deployment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lab := deployment.DeploymentLab

	notification := entity.ServerNotification{
		Id:               uuid.New().String(),
		NotificationType: entity.Info,
		Message:          string(entity.DestroyInProgress),
		AutoClose:        2000,
	}

	// Start the long-running operation in a goroutine
	go func() {
		deployment.DeploymentStatus = entity.DestroyInProgress
		if err := t.deploymentService.UpsertDeployment(deployment); err != nil {
			slog.Error("Error updating deployment", err)
		}
		t.actionStatusService.SetActionStart()
		if err := t.actionStatusService.SetServerNotification(notification); err != nil {
			slog.Error("Error setting server notification", err)
		}
		if err := t.terraformService.Destroy(lab); err != nil {
			notification.NotificationType = entity.Error
			notification.Message = string(entity.DestroyFailed)
			deployment.DeploymentStatus = entity.DestroyFailed
		} else {
			notification.NotificationType = entity.Success
			notification.Message = string(entity.DestroyCompleted)
			deployment.DeploymentStatus = entity.DestroyCompleted
		}
		if err := t.actionStatusService.SetServerNotification(notification); err != nil {
			slog.Error("Error setting server notification", err)
		}
		if err := t.deploymentService.UpsertDeployment(deployment); err != nil {
			slog.Error("Error updating deployment", err)
		}
		if err := t.actionStatusService.SetActionEnd(); err != nil {
			slog.Error("Error setting action end", err)
		}
	}()

	// Respond back to the request with the operation ID
	c.Status(http.StatusAccepted)
}
