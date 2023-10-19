package service

import (
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type RedisService struct {
	redisRepository entity.RedisRepository
}

func NewRedisService(redisReposiroty entity.RedisRepository) entity.RedisService {
	return &RedisService{
		redisRepository: redisReposiroty,
	}
}

func (r *RedisService) ResetServerCache() error {
	slog.Info("Resetting Server Cache")
	if err := r.redisRepository.ResetServerCache(); err != nil {
		slog.Error("Not able to reset server cache", err)
		return err
	}

	slog.Debug("Server Cachek Reset complete")
	return nil
}
