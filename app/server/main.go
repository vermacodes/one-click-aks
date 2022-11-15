package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Status struct {
	Status string `json:"status"`
}

func status(c *gin.Context) {

	status := Status{}
	status.Status = "OK"

	c.IndentedJSON(http.StatusOK, status)
}

func handleRequests() {
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "https://ashisverma.z13.web.core.windows.net", "https://*.azurewebsites.net"}
	router.Use(cors.New(config))

	router.POST("/apply", apply)
	router.POST("/plan", plan)
	router.POST("/destroy", destroy)
	router.POST("/lab", breakLab)
	router.POST("/validatelab", validateLab)
	router.GET("/status", status)
	router.GET("/healthz", status)
	router.GET("/accountshow", accountShow)
	router.GET("/login", accountLogin)
	router.GET("/loginstatus", validateLogin)
	router.GET("/getstate", getStateStorageConfiguration)
	router.GET("/configurestate", configureStateStorage)
	router.GET("/sharedtemplates", listSharedTemplates)
	router.POST("/createlab", createLab)
	router.POST("/deploylab", deployLab)
	router.POST("/breaklab", breakLab)
	router.POST("/validate", validate)
	router.GET("/listlabs", listLabs)
	router.GET("/actionstatus", getActionStatus)
	router.POST("/actionstatus", setActionStatus)
	router.Run(":8080")
}

func main() {
	handleRequests()
}
