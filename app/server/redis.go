package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v9"
)

var ctx = context.Background()

type ActionStatus struct {
	InProgress bool `json:"inProgress"`
}

func newRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
}

func getActionStatus(c *gin.Context) {
	rdb := newRedisClient()

	val, err := rdb.Get(ctx, "ActionStatus").Result()
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}

	action := ActionStatus{}
	if err = json.Unmarshal([]byte(val), &action); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, action)
}

func setActionStatus(c *gin.Context) {
	rdb := newRedisClient()
	action := ActionStatus{}

	if err := c.BindJSON(&action); err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	json, err := json.Marshal(action)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	rdb.Set(ctx, "ActionStatus", json, 0)
	c.Status(http.StatusCreated)
}

func setLogs(c *gin.Context) {
	logs := LogStreamType{}
	if err := c.BindJSON(&logs); err != nil {
		c.Status(http.StatusInternalServerError)
	}
	writeLogsRedis(&logs) //Always setting to empty. Fix this.
	c.Status(http.StatusCreated)
}

func getLogs(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, readLogsRedis())
}

func endStream(c *gin.Context) {
	endLogsStream()
	c.Status(http.StatusOK)
}
