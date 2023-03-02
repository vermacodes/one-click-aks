package repository

import (
	"os/exec"

	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type authRepository struct{}

func NewAuthRepository() entity.AuthRepository {
	return &authRepository{}
}

func (a *authRepository) ServicePrincipalLogin() (string, error) {
	out, err := exec.Command("bash", "-c", "az login --service-principal -u $ARM_CLIENT_ID -p $ARM_CLIENT_SECRET --tenant $ARM_TENANT_ID").Output()
	return string(out), err
}

func (a *authRepository) ServicePrincipalLoginStatus() (string, error) {
	out, err := exec.Command("bash", "-c", "az account get-access-token -o json").Output()
	return string(out), err
}

func (a *authRepository) GetServicePrincipalLoginStatusFromRedis() (string, error) {
	return getRedis("spLoginStatus")
}

func (a *authRepository) SetServicePrincipalLoginStatusInRedis(val string) error {
	return setRedis("spLoginStatus", val)
}

func (a *authRepository) GetAccounts() (string, error) {
	out, err := exec.Command("bash", "-c", "az account list -o json").Output()
	return string(out), err
}

func (a *authRepository) GetAccountsFromRedis() (string, error) {
	return getRedis("accounts")
}

func (a *authRepository) SetAccountsInRedis(val string) error {
	return setRedis("accounts", val)
}

func (a *authRepository) SetAccount(accountId string) error {
	_, err := exec.Command("bash", "-c", "az account set --subscription "+accountId).Output()
	return err
}

func (a *authRepository) DeleteAccountsFromRedis() error {
	return deleteRedis("accounts")
}
