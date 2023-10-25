package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type terraformHandler struct {
	terraformService entity.TerraformService
}

func NewTerraformHandler(r *gin.RouterGroup, service entity.TerraformService) {
	handler := &terraformHandler{
		terraformService: service,
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
	// w.WriteHeader(http.StatusOK)

	if err := t.terraformService.Apply(lab); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		w.WriteHeader(http.StatusOK)
	}

	w.(http.Flusher).Flush()
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

	w := c.Writer
	header := w.Header()
	header.Set("Transfer-Encoding", "chunked")
	header.Set("Content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.(http.Flusher).Flush()

	t.terraformService.Destroy(lab)
}
