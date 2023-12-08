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

func NewStorageAccountHandler(r *gin.RouterGroup, service entity.StorageAccountService) {
	handler := &StorageAccountHandler{
		storageAccountService: service,
	}

	r.GET("/storageaccount", handler.GetStorageAccountConfiguration)
}

func NewStorageAccountWithActionStatusHandler(r *gin.RouterGroup, service entity.StorageAccountService) {
	handler := &StorageAccountHandler{
		storageAccountService: service,
	}

	r.POST("/storageaccount", handler.ConfigureStorageAccount)
	r.PUT("/storageaccount/breakbloblease/:workspaceName", handler.BreakBlobLease)
}

func (s *StorageAccountHandler) GetStorageAccountConfiguration(c *gin.Context) {
	configuration := entity.StateConfiguration{}
	storageAccountName, err := s.storageAccountService.GetStorageAccountName()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	resourceGroup, err := s.storageAccountService.GetResourceGroup()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	storageAccount, err := s.storageAccountService.GetStorageAccount(storageAccountName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	blobContainer, err := s.storageAccountService.GetBlobContainer(storageAccountName, "tfstate")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	configuration.ResourceGroup = resourceGroup
	configuration.StorageAccount = storageAccount
	configuration.BlobContainer = blobContainer

	c.IndentedJSON(http.StatusOK, configuration)
}

func (s *StorageAccountHandler) ConfigureStorageAccount(c *gin.Context) {
	configuration := entity.StateConfiguration{}

	resourceGroup, err := s.storageAccountService.CreateResourceGroup()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	storageAccount, err := s.storageAccountService.CreateStorageAccount(helper.Generate(12))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	blobContainer, err := s.storageAccountService.CreateBlobContainer(storageAccount.Name, "tfstate")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Creating continer for labs.
	s.storageAccountService.CreateBlobContainer(storageAccount.Name, "labs")

	configuration.ResourceGroup = resourceGroup
	configuration.StorageAccount = storageAccount
	configuration.BlobContainer = blobContainer

	c.IndentedJSON(http.StatusCreated, configuration)
}

func (s *StorageAccountHandler) BreakBlobLease(c *gin.Context) {

	workspaceName := c.Param("workspaceName")
	if workspaceName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "workspaceName is required"})
		return
	}

	storageAccountName, err := s.storageAccountService.GetStorageAccountName()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = s.storageAccountService.BreakBlobLease(storageAccountName, "tfstate", workspaceName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"status": "success"})
}
