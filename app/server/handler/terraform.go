package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type terraformHandler struct {
	terraformService    entity.TerraformService
	actionStatusService entity.ActionStatusService
}

func NewTerraformWithActionStatusHandler(r *gin.RouterGroup, service entity.TerraformService, actionStatusService entity.ActionStatusService) {
	handler := &terraformHandler{
		terraformService:    service,
		actionStatusService: actionStatusService,
	}

	r.POST("/terraform/init", handler.Init)
	r.POST("/terraform/plan", handler.Plan)
	r.POST("/terraform/apply", handler.Apply)
	r.POST("/terraform/destroy", handler.Destroy)
	r.POST("/terraform/extend/:mode", handler.Extend)
}

func (t *terraformHandler) Init(c *gin.Context) {

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	t.terraformService.Init()
}

func (t *terraformHandler) Plan(c *gin.Context) {
	lab := entity.LabType{}
	if err := c.Bind(&lab); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	terraformOperation := entity.TerraformOperation{
		OperationId: uuid.New().String(),
		InProgress:  true,
		Status:      entity.PlanInProgress,
	}

	t.actionStatusService.SetTerraformOperation(terraformOperation)

	// Start the long-running operation in a goroutine
	go func() {
		t.actionStatusService.SetActionStart()
		if err := t.terraformService.Plan(lab); err != nil {
			terraformOperation.Status = entity.PlanFailed
		} else {
			terraformOperation.Status = entity.PlanCompleted
		}
		terraformOperation.InProgress = false
		t.actionStatusService.SetTerraformOperation(terraformOperation)
		t.actionStatusService.SetActionEnd()
	}()

	// Respond back to the request with the operation ID
	c.IndentedJSON(http.StatusOK, terraformOperation)
}

func (t *terraformHandler) Apply(c *gin.Context) {
	lab := entity.LabType{}
	if err := c.Bind(&lab); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	terraformOperation := entity.TerraformOperation{
		OperationId: uuid.New().String(),
		InProgress:  true,
		Status:      entity.DeploymentInProgress,
	}

	t.actionStatusService.SetTerraformOperation(terraformOperation)

	// Start the long-running operation in a goroutine
	go func() {
		t.actionStatusService.SetActionStart()
		if err := t.terraformService.Apply(lab); err != nil {
			terraformOperation.Status = entity.DeploymentFailed
		} else {
			terraformOperation.Status = entity.DeploymentCompleted
		}
		terraformOperation.InProgress = false
		t.actionStatusService.SetTerraformOperation(terraformOperation)
		t.actionStatusService.SetActionEnd()
	}()

	// Respond back to the request with the action ID
	c.IndentedJSON(http.StatusOK, terraformOperation)
}

func (t *terraformHandler) Extend(c *gin.Context) {
	lab := entity.LabType{}
	mode := c.Param("mode")
	if err := c.Bind(&lab); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")

	if err := t.terraformService.Extend(lab, mode); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		w.WriteHeader(http.StatusOK)
	}

	w.(http.Flusher).Flush()
}

func (t *terraformHandler) Destroy(c *gin.Context) {
	lab := entity.LabType{}
	if err := c.Bind(&lab); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	terraformOperation := entity.TerraformOperation{
		OperationId: uuid.New().String(),
		InProgress:  true,
		Status:      entity.DestroyingResources,
	}

	t.actionStatusService.SetTerraformOperation(terraformOperation)

	// Start the long-running operation in a goroutine
	go func() {
		t.actionStatusService.SetActionStart()
		if err := t.terraformService.Destroy(lab); err != nil {
			terraformOperation.Status = entity.DestroyFailed
		} else {
			terraformOperation.Status = entity.ResourcesDestroyed
		}
		terraformOperation.InProgress = false
		t.actionStatusService.SetTerraformOperation(terraformOperation)
		t.actionStatusService.SetActionEnd()
	}()

	// Respond back to the request with the operation ID
	c.IndentedJSON(http.StatusOK, terraformOperation)
}
