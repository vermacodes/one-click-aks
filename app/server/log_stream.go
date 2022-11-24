package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type LogStreamType struct {
	IsStreaming bool   `json:"isStreaming"`
	Logs        string `json:"logs"`
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

func endLogsStream() {
	log.Println("Ending Stream in 5 seconds")
	time.Sleep(5 * time.Second)
	appendLogsRedis(fmt.Sprintf("%s\n", "end"))
	for {
		currLogsStream := readLogsRedis()
		currLogs, err := base64.StdEncoding.DecodeString(currLogsStream.Logs)
		if err != nil {
			log.Println("Error in appendLogRedis")
			return
		}
		newLogsStream := LogStreamType{
			IsStreaming: false,
			Logs:        base64.StdEncoding.EncodeToString([]byte(string(currLogs))),
		}

		writeLogsRedis(&newLogsStream)

		if !readLogsRedis().IsStreaming {
			break
		}
		log.Println("Stream not ended. Will try again in 1 second")
		time.Sleep(1 * time.Second)
	}
}

func appendLogsRedis(logs string) {
	currLogsStream := readLogsRedis()
	currLogs, err := base64.StdEncoding.DecodeString(currLogsStream.Logs)
	if err != nil {
		log.Println("Error in appendLogRedis")
		return
	}
	newLogsStream := LogStreamType{
		IsStreaming: currLogsStream.IsStreaming,
		Logs:        base64.StdEncoding.EncodeToString([]byte(string(currLogs) + logs)),
	}

	writeLogsRedis(&newLogsStream)
}

func writeLogsRedis(logs *LogStreamType) {
	rdb := newRedisClient()
	json, err := json.Marshal(logs)
	if err != nil {
		log.Println("Error Marshal in writeLogsRedis")
	}
	rdb.Set(ctx, "Logs", json, 0)
}

func readLogsRedis() LogStreamType {
	rdb := newRedisClient()
	logs := LogStreamType{}
	val, err := rdb.Get(ctx, "Logs").Result()
	if err != nil {
		log.Println("Error : ", err)
		return logs
	}
	if err = json.Unmarshal([]byte(val), &logs); err != nil {
		log.Println("Error unmarshal logs in readLogsRedis")
	}
	return logs
}
