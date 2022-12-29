package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type assigmentHandler struct {
	assignmentService entity.AssignmentService
}

func NewAssignmentHandler(r *gin.RouterGroup, service entity.AssignmentService) {
	handler := &assigmentHandler{
		assignmentService: service,
	}

	r.GET("/assignment", handler.GetAssignments)
	r.GET("/assignment/my", handler.GetMyAssignments)
	r.POST("/assignment", handler.CreateAssignment)
	r.DELETE("/assignment", handler.DeleteAssignment)
}

func (a *assigmentHandler) GetAssignments(c *gin.Context) {
	assignments, err := a.assignmentService.GetAssignments()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, assignments)
}

func (a *assigmentHandler) GetMyAssignments(c *gin.Context) {
	assignments, err := a.assignmentService.GetMyAssignments()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, assignments)
}

func (a *assigmentHandler) CreateAssignment(c *gin.Context) {
	assignment := entity.Assigment{}
	if err := c.Bind(&assignment); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	if err := a.assignmentService.CreateAssignment(assignment); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusCreated)
}

func (a *assigmentHandler) DeleteAssignment(c *gin.Context) {
	assignment := entity.Assigment{}
	if err := c.Bind(&assignment); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	if err := a.assignmentService.DeleteAssignment(assignment); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusCreated)
}
