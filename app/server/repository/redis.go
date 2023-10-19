package repository

import (
	"context"

	"github.com/go-redis/redis/v9"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

var ctx = context.Background()

func newRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
}

type RedisRepository struct{}

func NewRedisRepository() entity.RedisRepository {
	return &RedisRepository{}
}

func (r *RedisRepository) ResetServerCache() error {
	rdb := newRedisClient()
	return rdb.FlushAll(ctx).Err()
}

func getRedis(key string) (string, error) {
	rdb := newRedisClient()
	return rdb.Get(ctx, key).Result()
}

func setRedis(key string, val string) error {
	rdb := newRedisClient()
	return rdb.Set(ctx, key, val, 0).Err()
}

func deleteRedis(key string) error {
	rdb := newRedisClient()
	return rdb.Del(ctx, key).Err()
}

func deleteAllRedis() error {
	rdb := newRedisClient()
	return rdb.FlushAll(ctx).Err()
}
