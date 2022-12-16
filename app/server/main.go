package main

import (
	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/handler"
	"github.com/vermacodes/one-click-aks/app/server/repository"
	"github.com/vermacodes/one-click-aks/app/server/service"
)

func main() {
	router := gin.Default()

	tfvarRepository := repository.NewRedisTfvarRepository()
	tfvarService := service.NewTfvarService(tfvarRepository)
	handler.NewTfvarHandler(router, tfvarService)

	workspaceRepository := repository.NewTfWorkspaceRepository()
	storageAccountRepository := repository.NewStorageAccountRepository()
	storageAccountService := service.NewStorageAccountService(storageAccountRepository)
	workspaceService := service.NewWorksapceService(workspaceRepository, storageAccountService)
	handler.NewWorkspaceHandler(router, workspaceService)
	handler.NewStorageAccountHandler(router, storageAccountService)

	logStreamRepository := repository.NewLogStreamRepository()
	logStreamService := service.NewLogStreamService(logStreamRepository)

	actionStatusRepository := repository.NewActionStatusRepository()
	actionStatusService := service.NewActionStatusService(actionStatusRepository)

	authRepository := repository.NewAuthRepository()
	authService := service.NewAuthService(authRepository, logStreamService, actionStatusService)
	handler.NewAuthHandler(router, authService)

	router.Run()
}
