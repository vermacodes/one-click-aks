package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Priviledge struct {
	User     string `json:"user"`
	IsAdmin  bool   `json:"isAdmin"`
	IsMentor bool   `json:"isMentor"`
}

func contains(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}
	return false
}

func isAdmin(user string) bool {
	//TODO: actually implement getting the list from a security group.
	return contains([]string{"ashisverma@microsoft.com", "evalan@microsoft.com", "amargherio@microsoft.com", "eric.lucier@microsoft.com"}, user)
}

func isMentor(user string) bool {
	//TODO: actually implement getting the list from a security group.
	return contains([]string{"ashisverma@microsoft.com", "evalan@microsoft.com", "amargherio@microsoft.com", "ericlucier@microsoft.com"}, user)
}

func getPrivileges() (Priviledge, error) {
	account, err := accountShow()
	privilege := Priviledge{}
	if err != nil {
		return privilege, err
	}
	privilege.User = account.User.Name
	privilege.IsAdmin = (isAdmin(account.User.Name))
	privilege.IsMentor = (isMentor(account.User.Name))
	return privilege, err
}

func getPrivilegesApi(c *gin.Context) {
	privilege, err := getPrivileges()
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.IndentedJSON(http.StatusOK, privilege)
}
