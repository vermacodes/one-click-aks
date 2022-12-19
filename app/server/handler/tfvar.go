package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type TfvarHandler struct {
	TfvarService entity.TfvarService
}

func NewTfvarHandler(r *gin.Engine, service entity.TfvarService) {
	handler := &TfvarHandler{
		TfvarService: service,
	}

	r.GET("/tfvar", handler.GetTfvar)
	r.PUT("tfvar", handler.SetTfvar)
}

func (t *TfvarHandler) GetTfvar(c *gin.Context) {
	tfvar, err := t.TfvarService.Get()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, tfvar)
}

func (t *TfvarHandler) SetTfvar(c *gin.Context) {

	tfvar := entity.TfvarConfigType{}

	if err := c.Bind(&tfvar); err != nil {
		log.Println("Unable to bind the body to object", err)
		c.Status(http.StatusBadRequest)
		return
	}

	tfvar, err := t.TfvarService.Put(tfvar)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, tfvar)
}
