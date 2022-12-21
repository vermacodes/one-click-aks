package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/handler"
	"github.com/vermacodes/one-click-aks/app/server/repository"
	"github.com/vermacodes/one-click-aks/app/server/service"
)

type Status struct {
	Status string `json:"status"`
}

func status(c *gin.Context) {

	status := Status{}
	status.Status = "OK"

	c.IndentedJSON(http.StatusOK, status)
}

func main() {
	router := gin.Default()
	router.SetTrustedProxies(nil)

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173", "https://ashisverma.z13.web.core.windows.net", "https://*.azurewebsites.net"}
	router.Use(cors.New(config))

	storageAccountRepository := repository.NewStorageAccountRepository()
	storageAccountService := service.NewStorageAccountService(storageAccountRepository)
	handler.NewStorageAccountHandler(router, storageAccountService)

	actionStatusRepository := repository.NewActionStatusRepository()
	actionStatusService := service.NewActionStatusService(actionStatusRepository)
	handler.NewActionStatusHanlder(*router, actionStatusService)

	workspaceRepository := repository.NewTfWorkspaceRepository()
	workspaceService := service.NewWorksapceService(workspaceRepository, storageAccountService, actionStatusService)
	handler.NewWorkspaceHandler(router, workspaceService)

	logStreamRepository := repository.NewLogStreamRepository()
	logStreamService := service.NewLogStreamService(logStreamRepository)
	handler.NewLogStreamHandler(router, logStreamService)

	authRepository := repository.NewAuthRepository()
	authService := service.NewAuthService(authRepository, logStreamService, actionStatusService)
	handler.NewAuthHandler(router, authService)

	prefRepository := repository.NewPreferenceRepository()
	prefService := service.NewPreferenceService(prefRepository, storageAccountService)
	handler.NewPreferenceHandler(router, prefService)

	kVersionRepository := repository.NewKVersionRepository()
	kVersionService := service.NewKVersionService(kVersionRepository, prefService)
	handler.NewKVersionHandler(router, kVersionService)

	labRepository := repository.NewLabRespository()
	labService := service.NewLabService(labRepository, kVersionService, storageAccountService)
	handler.NewLabHandler(router, labService)

	assignmentRepository := repository.NewAssignmentRepository()
	assignmentService := service.NewAssignmentService(assignmentRepository)
	handler.NewAssignmentHandler(router, assignmentService)

	terraformRepository := repository.NewTerraformRepository()
	terraformService := service.NewTerraformService(terraformRepository, labService, workspaceService, logStreamService, actionStatusService, kVersionService, storageAccountService)
	handler.NewTerraformHandler(router, terraformService)

	router.GET("/status", status)
	router.Run()
}
