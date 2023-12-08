package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type RedisHandler struct {
	RedisService entity.RedisService
}

func NewRedisHandler(r *gin.RouterGroup, redisService entity.RedisService) {
	handler := &RedisHandler{
		RedisService: redisService,
	}

	r.DELETE("/cache", handler.DeleteServerCache)
}

func (r *RedisHandler) DeleteServerCache(c *gin.Context) {
	if err := r.RedisService.ResetServerCache(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
