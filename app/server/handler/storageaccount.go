package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vermacodes/one-click-aks/app/server/entity"
	"github.com/vermacodes/one-click-aks/app/server/helper"
)

type StorageAccountHandler struct {
	storageAccountService entity.StorageAccountService
}

func NewStorageAccountHandler(r *gin.Engine, service entity.StorageAccountService) {
	handler := &StorageAccountHandler{
		storageAccountService: service,
	}

	r.GET("/storageaccount", handler.GetStorageAccountConfiguration)
	r.POST("/storageaccount", handler.ConfigureStorageAccount)
}

func (s *StorageAccountHandler) GetStorageAccountConfiguration(c *gin.Context) {
	configuration := entity.StateConfiguration{}
	storageAccountName, err := s.storageAccountService.GetStorageAccountName()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	resourceGroup, err := s.storageAccountService.GetResourceGroup()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	storageAccount, err := s.storageAccountService.GetStorageAccount(storageAccountName)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	blobContainer, err := s.storageAccountService.GetBlobContainer(storageAccountName, "tfstate")
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	configuration.ResourceGroup = resourceGroup
	configuration.StorageAccount = storageAccount
	configuration.BlobContainer = blobContainer

	c.IndentedJSON(http.StatusOK, configuration)
}

func (s *StorageAccountHandler) ConfigureStorageAccount(c *gin.Context) {
	configuration := entity.StateConfiguration{}

	resourceGroup, err := s.storageAccountService.CreateResoureceGroup()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	storageAccount, err := s.storageAccountService.CreateStorageAccount(helper.Generate(12))
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	blobContainer, err := s.storageAccountService.CreateBlobContainer(storageAccount.Name, "tfstate")
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	// Creating continer for labs.
	s.storageAccountService.CreateBlobContainer(storageAccount.Name, "labs")

	configuration.ResourceGroup = resourceGroup
	configuration.StorageAccount = storageAccount
	configuration.BlobContainer = blobContainer

	c.IndentedJSON(http.StatusCreated, configuration)
}
