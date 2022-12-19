package repository

import (
	"os"
	"os/exec"

	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type authRepository struct{}

func NewAuthRepository() entity.AuthRepository {
	return &authRepository{}
}

func (a *authRepository) Login() (*exec.Cmd, *os.File, *os.File, error) {
	cmd := exec.Command("bash", "-c", "az login --use-device-code")
	rPipe, wPipe, err := os.Pipe()
	if err != nil {
		return cmd, rPipe, wPipe, err
	}
	cmd.Stdout = wPipe
	cmd.Stderr = wPipe
	if err := cmd.Start(); err != nil {
		return cmd, rPipe, wPipe, err
	}

	return cmd, rPipe, wPipe, nil
}

func (a *authRepository) GetLoginStatus() (string, error) {
	out, err := exec.Command("bash", "-c", "az account get-access-token -o json").Output()
	return string(out), err
}

func (a *authRepository) GetLoginStatusFromRedis() (string, error) {
	return getRedis("loginStatus")
}

func (a *authRepository) SetLoginStatusInRedis(val string) error {
	return setRedis("loginStatus", val)
}

func (a *authRepository) GetAccount() (string, error) {
	out, err := exec.Command("bash", "-c", "az account show -o json").Output()
	return string(out), err
}

func (a *authRepository) GetAccountFromRedis() (string, error) {
	return getRedis("currentAccount")
}

func (a *authRepository) SetAccountInRedis(val string) error {
	return setRedis("currentAccount", val)
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

func (a *authRepository) DeleteAccountFromRedis() error {
	return deleteRedis("currentAccount")
}

func (a *authRepository) DeleteAccountsFromRedis() error {
	return deleteRedis("accounts")
}
