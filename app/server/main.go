package main

import (
	"net/http"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/handler"
	"github.com/vermacodes/one-click-aks/app/server/middleware"
	"github.com/vermacodes/one-click-aks/app/server/repository"
	"github.com/vermacodes/one-click-aks/app/server/service"
	"golang.org/x/exp/slog"
)

type Status struct {
	Status  string `json:"status"`
	Version string `json:"version"`
}

var version string

func status(c *gin.Context) {

	status := Status{}
	status.Status = "OK"
	status.Version = version

	c.IndentedJSON(http.StatusOK, status)
}

func main() {

	logLevel := os.Getenv("LOG_LEVEL")
	logLevelInt, err := strconv.Atoi(logLevel)
	if err != nil {
		logLevelInt = 0
	}

	opts := slog.HandlerOptions{
		AddSource: true,
		Level:     slog.Level(logLevelInt),
	}

	slog.SetDefault(slog.New(opts.NewTextHandler(os.Stderr)))

	router := gin.Default()
	router.SetTrustedProxies(nil)

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173", "https://ashisverma.z13.web.core.windows.net", "https://actlabs.z13.web.core.windows.net", "https://actlabsbeta.z13.web.core.windows.net", "https://actlabs.azureedge.net", "https://*.azurewebsites.net"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Authorization", "Content-Type"}

	router.Use(cors.New(config))

	authRouter := router.Group("/")
	actionStatusRouter := router.Group("/")

	// TODO: We are in service dependency hell down here. Should we use HTTP instead? It will but may not add noticeable latency.
	logStreamRepository := repository.NewLogStreamRepository()
	logStreamService := service.NewLogStreamService(logStreamRepository)
	handler.NewLogStreamHandler(router, logStreamService)

	loggingRepository := repository.NewLoggingRepository()
	loggingService := service.NewLoggingService(loggingRepository)

	actionStatusRepository := repository.NewActionStatusRepository()
	actionStatusService := service.NewActionStatusService(actionStatusRepository)
	handler.NewActionStatusHandler(router, actionStatusService)

	actionStatusRouter.Use(middleware.ActionStatusMiddleware(actionStatusService))

	redisRepository := repository.NewRedisRepository()
	redisService := service.NewRedisService(redisRepository)
	handler.NewRedisHandler(actionStatusRouter, redisService)

	authRepository := repository.NewAuthRepository()
	authService := service.NewAuthService(authRepository, actionStatusService, loggingService, redisRepository)
	handler.NewLoginHandler(router, authService)

	authRouter.Use(middleware.AuthRequired(authService, logStreamService))

	authWithActionRouter := authRouter.Group("/")
	authWithActionRouter.Use(middleware.ActionStatusMiddleware(actionStatusService))

	handler.NewAuthHandler(authRouter, authService)
	handler.NewAuthWithActionStatusHandler(authWithActionRouter, authService)

	storageAccountRepository := repository.NewStorageAccountRepository()
	storageAccountService := service.NewStorageAccountService(storageAccountRepository)
	handler.NewStorageAccountHandler(authRouter, storageAccountService)
	handler.NewStorageAccountWithActionStatusHandler(authWithActionRouter, storageAccountService)

	workspaceRepository := repository.NewTfWorkspaceRepository()
	workspaceService := service.NewWorkspaceService(workspaceRepository, storageAccountService, actionStatusService)
	handler.NewWorkspaceHandler(authRouter, workspaceService)

	prefRepository := repository.NewPreferenceRepository()
	prefService := service.NewPreferenceService(prefRepository, storageAccountService)
	handler.NewPreferenceHandler(authRouter, prefService)

	kVersionRepository := repository.NewKVersionRepository()
	kVersionService := service.NewKVersionService(kVersionRepository, prefService)
	handler.NewKVersionHandler(authRouter, kVersionService)

	labRepository := repository.NewLabRepository()
	labService := service.NewLabService(labRepository, kVersionService, storageAccountService, authService)
	handler.NewLabHandler(authRouter, labService)

	terraformRepository := repository.NewTerraformRepository()
	terraformService := service.NewTerraformService(terraformRepository, labService, workspaceService, logStreamService, actionStatusService, kVersionService, storageAccountService, loggingService, authService)
	handler.NewTerraformWithActionStatusHandler(authWithActionRouter, terraformService)

	deploymentRepository := repository.NewDeploymentRepository()
	deploymentService := service.NewDeploymentService(deploymentRepository, labService, terraformService, actionStatusService, logStreamService, authService, workspaceService)
	handler.NewDeploymentHandler(authRouter, deploymentService)
	handler.NewDeploymentWithActionStatusHandler(authWithActionRouter, deploymentService)

	// take seconds and multiply with 1000000000 and pass it to the function.
	go deploymentService.PollAndDeleteDeployments(60000000000)

	router.GET("/status", status)
	router.Run()
}
