package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type terraformHandler struct {
	terraformService entity.TerraformService
}

func NewTerraformHandler(r *gin.Engine, service entity.TerraformService) {
	handler := &terraformHandler{
		terraformService: service,
	}

	r.POST("/init", handler.Init)
	r.POST("/plan", handler.Plan)
	r.POST("/apply", handler.Apply)
	r.POST("/destroy", handler.Destroy)
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

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	t.terraformService.Plan(lab)
}

func (t *terraformHandler) Apply(c *gin.Context) {
	lab := entity.LabType{}
	if err := c.Bind(&lab); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	t.terraformService.Apply(lab)
}

func (t *terraformHandler) Destroy(c *gin.Context) {
	lab := entity.LabType{}
	if err := c.Bind(&lab); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	t.terraformService.Destroy(lab)
}
