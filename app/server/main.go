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

	router.Run()
}
