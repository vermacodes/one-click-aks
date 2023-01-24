package service

import (
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type RedisService struct {
	redisService entity.RedisService
}

func NewRedisService(redisService entity.RedisService) entity.RedisService {
	return &RedisService{
		redisService: redisService,
	}
}

func (r *RedisService) ResetServerCache() error {
	slog.Info("Resetting Server Cache")
	if err := r.redisService.ResetServerCache(); err != nil {
		slog.Error("Not able to reset server cache", err)
		return err
	}

	slog.Info("Server Cachek Reset complete")
	return nil
}
