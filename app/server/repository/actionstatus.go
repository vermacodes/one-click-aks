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

func (a *actionStatusRepository) WaitForActionStatusChange() (string, error) {
	rdb := newActionStatusRedisClient().Subscribe(actionStatusCtx, "redis-action-status-pubsub-channel")
	defer rdb.Close()

	for {
		msg, err := rdb.ReceiveMessage(actionStatusCtx)
		if err != nil {
			return "", err
		}

		return msg.Payload, nil
	}
}

func (a *actionStatusRepository) SetTerraformOperation(val string) error {
	rdb := newActionStatusRedisClient()
	if err := rdb.Set(actionStatusCtx, "terraform-operation", val, 0).Err(); err != nil {
		return err
	}

	return rdb.Publish(actionStatusCtx, "redis-terraform-operation-pubsub-channel", val).Err()
}

func (a *actionStatusRepository) GetTerraformOperation() (string, error) {
	rdb := newActionStatusRedisClient()
	return rdb.Get(actionStatusCtx, "terraform-operation").Result()
}

func (a *actionStatusRepository) WaitForTerraformOperationChange() (string, error) {
	rdb := newActionStatusRedisClient().Subscribe(actionStatusCtx, "redis-terraform-operation-pubsub-channel")
	defer rdb.Close()

	for {
		msg, err := rdb.ReceiveMessage(actionStatusCtx)
		if err != nil {
			return "", err
		}

		return msg.Payload, nil
	}
}

func (a *actionStatusRepository) SetServerNotification(val string) error {
	rdb := newActionStatusRedisClient()
	if err := rdb.Set(actionStatusCtx, "server-notification", val, 0).Err(); err != nil {
		return err
	}

	return rdb.Publish(actionStatusCtx, "redis-server-notification-pubsub-channel", val).Err()
}

func (a *actionStatusRepository) GetServerNotification() (string, error) {
	rdb := newActionStatusRedisClient()
	return rdb.Get(actionStatusCtx, "server-notification").Result()
}

func (a *actionStatusRepository) WaitForServerNotificationChange() (string, error) {
	rdb := newActionStatusRedisClient().Subscribe(actionStatusCtx, "redis-server-notification-pubsub-channel")
	defer rdb.Close()

	for {
		msg, err := rdb.ReceiveMessage(actionStatusCtx)
		if err != nil {
			return "", err
		}

		return msg.Payload, nil
	}
}
