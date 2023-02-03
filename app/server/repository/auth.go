package repository

import (
	"encoding/json"
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

func (a *authRepository) StopRunningLoginAttempt() error {
	_, err := exec.Command("bash", "-c", "pkill -f 'az login'").Output()
	return err
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

func (a *authRepository) IsAdmin(user string) (bool, error) {
	out, err := exec.Command("bash", "-c", "az ad group member list --group 708d0729-779a-4f47-9ce0-393b839dad4f --output json --query [].userPrincipalName").Output()
	if err != nil {
		return false, err
	}
	return helperContains(out, user)
}

func (a *authRepository) IsMentor(user string) (bool, error) {
	out, err := exec.Command("bash", "-c", "az ad group member list --group 708d0729-779a-4f47-9ce0-393b839dad4f --output json --query [].userPrincipalName").Output()
	if err != nil {
		return false, err
	}
	return helperContains(out, user)

	// var empty []byte
	// return helperContains(empty, user)
}

func (a *authRepository) DeleteAllCache() error {
	return deleteAllRedis()
}

func helperContains(s []byte, str string) (bool, error) {

	var res []string
	err := json.Unmarshal(s, &res)
	if err != nil {
		return false, err
	}

	for _, v := range res {
		if v == str {
			return true, nil
		}
	}
	return false, nil
}
