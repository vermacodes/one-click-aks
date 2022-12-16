package entity

import (
	"os"
	"os/exec"
)

type User struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Tenant struct {
	TenantId string `json:"tenantId"`
}

type Account struct {
	EnvironmentName  string   `json:"environmentName"`
	HomeTenantId     string   `json:"homeTenantId"`
	Id               string   `json:"id"`
	IsDefault        bool     `json:"isDefault"`
	ManagedByTenants []Tenant `json:"managedByTenants"`
	Name             string   `json:"name"`
	State            string   `json:"state"`
	TenantId         string   `json:"tenantId"`
	User             User     `json:"user"`
}

type LoginStatus struct {
	IsLoggedIn bool `json:"isLoggedIn"`
}

type LoginMessage struct {
	LoginMessage string `json:"loginMessage"`
}

type AuthService interface {
	Login() (LoginStatus, error)
	// LoginStatus() (LoginStatus, error)
	// GetAccount() (Account, error)
	// GetAccounts() ([]Account, error)
	// SetAccount(account Account)
}

type AuthRepository interface {
	Login() (*exec.Cmd, *os.File, *os.File, error)
	// LoginStatus() error
	// GetAccount() (string, error)
	// GetAccounts() (string, error)
	// SetAccount(accountId string) error
}
