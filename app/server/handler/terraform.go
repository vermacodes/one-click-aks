package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
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

	r.POST("/terraform/init/:operationId", handler.Init)
	r.POST("/terraform/plan/:operationId", handler.Plan)
	r.POST("/terraform/apply/:operationId", handler.Apply)
	r.POST("/terraform/destroy/:operationId", handler.Destroy)
	r.POST("/terraform/extend/:mode/:operationId", handler.Extend)
}

func (t *terraformHandler) Init(c *gin.Context) {
	terraformOperation := entity.TerraformOperation{
		OperationId: c.Param("operationId"),
		InProgress:  true,
		Status:      entity.InitInProgress,
	}

	if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
		c.Status(http.StatusInternalServerError)
	}

	// Start the long-running operation in a goroutine
	go func() {
		t.actionStatusService.SetActionStart()
		if err := t.terraformService.Init(); err != nil {
			terraformOperation.Status = entity.InitFailed
		} else {
			terraformOperation.Status = entity.InitCompleted
		}
		terraformOperation.InProgress = false
		t.actionStatusService.SetTerraformOperation(terraformOperation)
		t.actionStatusService.SetActionEnd()
	}()

	// Respond back to the request with the operation ID
	c.IndentedJSON(http.StatusOK, terraformOperation)
}

func (t *terraformHandler) Plan(c *gin.Context) {
	lab := entity.LabType{}
	if err := c.Bind(&lab); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	terraformOperation := entity.TerraformOperation{
		OperationId: c.Param("operationId"),
		InProgress:  true,
		Status:      entity.PlanInProgress,
	}

	if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
		c.Status(http.StatusInternalServerError)
	}

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
		OperationId: c.Param("operationId"),
		InProgress:  true,
		Status:      entity.DeploymentInProgress,
	}

	if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
		c.Status(http.StatusInternalServerError)
	}

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
		OperationId: c.Param("operationId"),
		InProgress:  true,
		Status:      entity.DestroyInProgress,
	}

	if err := t.actionStatusService.SetTerraformOperation(terraformOperation); err != nil {
		c.Status(http.StatusInternalServerError)
	}

	// Start the long-running operation in a goroutine
	go func() {
		t.actionStatusService.SetActionStart()
		if err := t.terraformService.Destroy(lab); err != nil {
			terraformOperation.Status = entity.DestroyFailed
		} else {
			terraformOperation.Status = entity.DestroyCompleted
		}
		terraformOperation.InProgress = false
		t.actionStatusService.SetTerraformOperation(terraformOperation)
		t.actionStatusService.SetActionEnd()
	}()

	// Respond back to the request with the operation ID
	c.IndentedJSON(http.StatusOK, terraformOperation)
}
