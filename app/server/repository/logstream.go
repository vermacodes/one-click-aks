package repository

import (
	"context"

	"github.com/go-redis/redis/v9"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type logStreamRepository struct{}

func NewLogStreamRepository() entity.LogStreamRepository {
	return &logStreamRepository{}
}

var logStreamCtx = context.Background()

func newLogStreamRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
}

func (l *logStreamRepository) SetLogsInRedis(logStream string) error {
	rdb := newLogStreamRedisClient()
	if err := rdb.Set(logStreamCtx, "logs", logStream, 0).Err(); err != nil {
		return err
	}

	if err := rdb.Publish(logStreamCtx, "redis-log-stream-pubsub-channel", logStream).Err(); err != nil {
		return err
	}

	return nil
}

func (l *logStreamRepository) GetLogsFromRedis() (string, error) {
	rdb := newLogStreamRedisClient()
	return rdb.Get(logStreamCtx, "logs").Result()
}

func (l *logStreamRepository) WaitForLogsChange() (string, error) {
	rdb := newLogStreamRedisClient().Subscribe(logStreamCtx, "redis-log-stream-pubsub-channel")
	defer rdb.Close()

	for {
		msg, err := rdb.ReceiveMessage(logStreamCtx)
		if err != nil {
			return "", err
		}

		return msg.Payload, nil
	}
}
