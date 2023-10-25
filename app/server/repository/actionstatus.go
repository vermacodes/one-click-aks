package repository

import (
	"context"

	"github.com/go-redis/redis/v9"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type actionStatusRepository struct{}

func NewActionStatusRepository() entity.ActionStatusRepository {
	return &actionStatusRepository{}
}

var actionStatusCtx = context.Background()

func newActionStatusRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
}

func (a *actionStatusRepository) GetActionStatus() (string, error) {
	rdb := newActionStatusRedisClient()
	return rdb.Get(actionStatusCtx, "actionstatus").Result()
}

func (a *actionStatusRepository) SetActionStatus(val string) error {
	rdb := newActionStatusRedisClient()

	// Set the value in redis.
	if err := rdb.Set(actionStatusCtx, "actionstatus", val, 0).Err(); err != nil {
		return err
	}

	// Publish the value to the pubsub channel.
	if err := rdb.Publish(actionStatusCtx, "redis-action-status-pubsub-channel", val).Err(); err != nil {
		return err
	}

	return nil
}

func (a *actionStatusRepository) SetTerraformOperation(id string, val string) error {
	rdb := newActionStatusRedisClient()
	return rdb.Set(actionStatusCtx, id, val, 0).Err()
}

func (a *actionStatusRepository) GetTerraformOperation(id string) (string, error) {
	rdb := newActionStatusRedisClient()
	return rdb.Get(actionStatusCtx, id).Result()
}
