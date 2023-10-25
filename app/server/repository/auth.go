package repository

import (
	"context"
	"os/exec"

	"github.com/go-redis/redis/v9"
	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type authRepository struct{}

func NewAuthRepository() entity.AuthRepository {
	return &authRepository{}
}

var authCtx = context.Background()

func newAuthRedisClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
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
	rdb := newAuthRedisClient()
	return rdb.Get(authCtx, "spLoginStatus").Result()
}

func (a *authRepository) SetServicePrincipalLoginStatusInRedis(val string) error {
	rdb := newAuthRedisClient()
	return rdb.Set(authCtx, "spLoginStatus", val, 0).Err()
}

func (a *authRepository) GetAccounts() (string, error) {
	out, err := exec.Command("bash", "-c", "az account list -o json").Output()
	return string(out), err
}

func (a *authRepository) GetAccountsFromRedis() (string, error) {
	rdb := newAuthRedisClient()
	return rdb.Get(authCtx, "accounts").Result()
}

func (a *authRepository) SetAccountsInRedis(val string) error {
	rdb := newAuthRedisClient()
	return rdb.Set(authCtx, "accounts", val, 0).Err()
}

func (a *authRepository) SetAccount(accountId string) error {
	_, err := exec.Command("bash", "-c", "az account set --subscription "+accountId).Output()
	return err
}

func (a *authRepository) DeleteAccountsFromRedis() error {
	rdb := newAuthRedisClient()
	return rdb.Del(authCtx, "accounts").Err()
}
