package main

import (
	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/handler"
	"github.com/vermacodes/one-click-aks/app/server/repository"
	"github.com/vermacodes/one-click-aks/app/server/service"
)

func main() {
	router := gin.Default()
	router.SetTrustedProxies(nil)

	tfvarRepository := repository.NewRedisTfvarRepository()
	tfvarService := service.NewTfvarService(tfvarRepository)
	handler.NewTfvarHandler(router, tfvarService)

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

	router.Run()
}
