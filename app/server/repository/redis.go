package repository

import (
	"context"

	"github.com/go-redis/redis/v9"
)

var ctx = context.Background()

func newRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
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
