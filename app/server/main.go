package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Status struct {
	Status string `json:"status"`
}

// func enableCors(w *http.ResponseWriter) {
// 	(*w).Header().Set("Access-Control-Allow-Origin", "*")
// }

func status(c *gin.Context) {

	status := Status{}
	status.Status = "OK"

	c.IndentedJSON(http.StatusOK, status)
}

// func handleRequests() {
// 	router := violetear.New()
// 	router.HandleFunc("/accountlist", accountList)
// 	router.HandleFunc("/login", accountLogin)
// 	router.HandleFunc("/getstaterg", getResourceGroup)
// 	router.HandleFunc("/getstatestorageaccount", getStorageAccount)
// 	router.HandleFunc("/createstaterg", createResourceGroup)
// 	router.HandleFunc("/createstatestorageaccount", createStorageAccunt)
// 	//router.HandleFunc("/getcontainer", getContainerApi)
// 	router.HandleFunc("/isstateconfigured", isStateConfigured)
// 	router.HandleFunc("/getstate", getStateStorageConfiguration)
// 	router.HandleFunc("/configurestate", configureStateStorage)
// 	router.HandleFunc("/createcontainer", createBlobContainer)
// 	log.Fatal(http.ListenAndServe(":8080", router))
// }

func handleRequests() {
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	router.Use(cors.New(config))

	router.POST("/apply", apply)
	router.POST("/plan", plan)
	router.POST("/destroy", destroy)
	router.GET("/status", status)
	router.GET("/healthz", status)
	router.GET("/accountshow", accountShow)
	router.GET("/login", accountLogin)
	router.GET("/loginstatus", validateLogin)
	router.GET("/getstate", getStateStorageConfiguration)
	router.GET("/configurestate", configureStateStorage)
	router.Run(":8080")
}

func main() {
	handleRequests()
}
