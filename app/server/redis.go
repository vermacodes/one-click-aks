package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"log"
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
	logs.Logs = base64.StdEncoding.EncodeToString([]byte(string(logs.Logs)))
	writeLogsRedis(&logs) //Always setting to empty. Fix this.
	c.Status(http.StatusCreated)
}

func getLogs(c *gin.Context) {
	logs := readLogsRedis()
	decoded, err := base64.StdEncoding.DecodeString(logs.Logs)
	if err != nil {
		log.Println("Error decoding logs in getLogs", err)
	}
	logs.Logs = string(decoded)
	c.IndentedJSON(http.StatusOK, logs)
}

func endStream(c *gin.Context) {
	endLogsStream()
	c.Status(http.StatusOK)
}
