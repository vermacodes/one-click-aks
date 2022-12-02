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
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173", "https://ashisverma.z13.web.core.windows.net", "https://*.azurewebsites.net"}
	router.Use(cors.New(config))

	router.GET("/tfinit", tfInit)
	router.POST("/apply", apply)
	router.POST("/plan", plan)
	router.POST("/destroy", destroy)
	router.POST("/validatelab", validateLab)
	router.GET("/status", status)
	router.GET("/healthz", status)
	router.GET("/accountshow", accountShowApi)
	router.GET("/account", getAccounts)
	router.PUT("/account", putAccount)
	router.GET("/login", accountLogin)
	router.GET("/loginstatus", validateLogin)
	router.GET("/getstate", getStateStorageConfiguration)
	router.GET("/configurestate", configureStateStorage)
	router.GET("/sharedtemplates", listSharedTemplates)
	router.POST("/createlab", createLab)
	router.POST("/deploylab", deployLab)
	router.POST("/validate", validate)
	router.GET("/listlabs", listLabsApi)
	router.GET("/actionstatus", getActionStatus)
	router.POST("/actionstatus", setActionStatus)
	router.GET("/logs", getLogs)
	router.POST("/logs", setLogs)
	router.GET("/endstream", endStream)
	router.GET("/tfvar", getTfvar)
	router.POST("/tfvar", setTfvar)
	router.POST("tfvardefault", setDefaultTfvar)
	router.GET("/workspace", listWorkspaces)
	router.PUT("/workspace", selectWorkspace)
	router.DELETE("/workspace", deleteWorkspace)
	router.POST("/workspace", addWorkspace)
	router.GET("/preference", getPreference)
	router.PUT("/preference", putPreference)
	router.GET("/resources", listResoureces)
	router.POST("/labs", createLab)
	router.PUT("/labs", createLab)
	router.POST("/labs/:labaction/:labType/:labId", labAction)
	router.GET("/labs/:type", getLabs)
	router.DELETE("/labs", deleteLab)
	router.POST("/assignment", createAssignmentApi)
	router.GET("/assignments", listAssignmentsApi)
	router.GET("/userassignedlabs", listUserAssignedLabsApi)
	router.DELETE("/assignment/:assignmentId", deleteAssignment)
	router.GET("/privilege", getPrivilegesApi)
	router.Run(":8080")
}

func main() {
	handleRequests()
}
