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

	// tfvarRepository := repository.NewRedisTfvarRepository()
	// tfvarService := service.NewTfvarService(tfvarRepository)
	// handler.NewTfvarHandler(router, tfvarService)

	storageAccountRepository := repository.NewStorageAccountRepository()
	storageAccountService := service.NewStorageAccountService(storageAccountRepository)
	handler.NewStorageAccountHandler(router, storageAccountService)

	workspaceRepository := repository.NewTfWorkspaceRepository()
	workspaceService := service.NewWorksapceService(workspaceRepository, storageAccountService)
	handler.NewWorkspaceHandler(router, workspaceService)

	logStreamRepository := repository.NewLogStreamRepository()
	logStreamService := service.NewLogStreamService(logStreamRepository)
	handler.NewLogStreamHandler(router, logStreamService)

	actionStatusRepository := repository.NewActionStatusRepository()
	actionStatusService := service.NewActionStatusService(actionStatusRepository)
	handler.NewActionStatusHanlder(*router, actionStatusService)

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
	labService := service.NewLabService(labRepository, logStreamService, actionStatusService, kVersionService, storageAccountService)
	handler.NewLabHandler(router, labService)

	router.GET("/status", status)
	router.Run()
}
