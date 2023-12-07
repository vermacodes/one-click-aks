package service

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type authService struct {
	authRepository      entity.AuthRepository
	actionStatusService entity.ActionStatusService
	loggingService      entity.LoggingService
	redisService        entity.RedisService
}

func NewAuthService(authRepository entity.AuthRepository, actionStatusService entity.ActionStatusService, loggingService entity.LoggingService, redisService entity.RedisService) entity.AuthService {
	return &authService{
		authRepository:      authRepository,
		actionStatusService: actionStatusService,
		loggingService:      loggingService,
		redisService:        redisService,
	}
}

func (a *authService) ServicePrincipalLogin() (entity.LoginStatus, error) {
	loginStatus := entity.LoginStatus{}
	loginStatus.IsLoggedIn = false

	out, err := a.authRepository.ServicePrincipalLogin()
	if err != nil {
		slog.Error("not able to run login command", err)
		return loginStatus, err
	}

	slog.Debug("Login Output -> ", out)

	accounts := []entity.Account{}
	if err = json.Unmarshal([]byte(out), &accounts); err != nil {
		slog.Error("not able to marshal accounts from cli to object", err)
		return loginStatus, err
	}

	if len(accounts) == 0 {
		err := errors.New("logged in but no account found")
		slog.Error("no account found", err)
		return loginStatus, err
	}

	loginStatus.IsLoggedIn = true
	return loginStatus, nil

}

func (a *authService) ServicePrincipalLoginStatus() (entity.LoginStatus, error) {
	loginStatus := entity.LoginStatus{}
	accessToken := entity.AccessToken{}

	slog.Debug("Checking login status")

	out, err := a.authRepository.GetServicePrincipalLoginStatusFromRedis()
	if err == nil {
		slog.Debug("login status found in redis.")

		if err = json.Unmarshal([]byte(out), &accessToken); err != nil {
			slog.Error("not able to marshal access token from cli to object", err)
			return loginStatus, err
		}

		loginStatus, err := helperIsTokenValid(accessToken)
		if err == nil && loginStatus.IsLoggedIn {
			return loginStatus, err
		} else {
			slog.Debug("token in redis is expired")
		}
	} else {
		slog.Debug("login status not found in redis")
	}

	slog.Debug("Checking login status from cli")
	out, err = a.authRepository.ServicePrincipalLoginStatus()
	if err != nil {
		slog.Debug("Not logged In.")
		return a.ServicePrincipalLogin()
	}

	if err = json.Unmarshal([]byte(out), &accessToken); err != nil {
		slog.Error("not able to marshal access token from cli to object", err)
		return a.ServicePrincipalLogin()
	}

	slog.Debug("Checking if token is valid")
	loginStatus, err = helperIsTokenValid(accessToken)
	if err == nil && loginStatus.IsLoggedIn {
		a.authRepository.SetServicePrincipalLoginStatusInRedis(out)
		return loginStatus, err
	}

	return a.ServicePrincipalLogin()
}

func (a *authService) GetActiveAccount() (entity.Account, error) {
	accounts, err := a.GetAccounts()
	if err != nil {
		slog.Error("not able to get accounts", err)
		return entity.Account{}, err
	}

	for _, account := range accounts {
		if account.IsDefault {
			return account, nil
		}
	}

	return entity.Account{}, errors.New("no active account found")
}

func (a *authService) GetAccounts() ([]entity.Account, error) {
	accounts := []entity.Account{}

	out, err := a.authRepository.GetAccountsFromRedis()
	if err == nil {
		slog.Debug("current account found in redis.")
		if jsonErr := json.Unmarshal([]byte(out), &accounts); err != nil {
			slog.Error("unable to unmarshal output of cli to object", err)
			return accounts, jsonErr
		}
		return accounts, err
	}

	// Following will be executed only if accounts not found in redis.
	slog.Debug("accounts not found in redis. running cli command")
	out, err = a.authRepository.GetAccounts()
	if err != nil || out == "" {
		slog.Error("not able to run cli command to get current accounts", err)
		return accounts, err
	}

	if err := json.Unmarshal([]byte(out), &accounts); err != nil {
		slog.Error("unable to unmarshal output of cli to object", err)
		return accounts, err
	}

	if len(accounts) == 0 {
		err := errors.New("no account found")
		slog.Error("no account found", err)
		return accounts, err
	}

	// Set accounts in redis.
	if err := a.authRepository.SetAccountsInRedis(out); err != nil {
		slog.Error("not able to set accounts in redis.", err)
	}

	return accounts, nil
}

func (a *authService) SetAccount(account entity.Account) error {
	if err := a.authRepository.SetAccount(account.Id); err != nil {
		slog.Error("not able to set the account", err)
		return err
	}

	// reset all cache once the account is changed.
	if err := a.redisService.ResetServerCache(); err != nil {
		slog.Error("not able to reset server cache", err)
		return err
	}

	return nil
}

func helperIsTokenValid(accessToken entity.AccessToken) (entity.LoginStatus, error) {
	loginStatus := entity.LoginStatus{}

	timezone, _ := time.Now().Zone()
	slog.Debug("Timezone " + timezone)

	layout := "2006-01-02 15:04:05.000000 MST"

	t, err := time.Parse(layout, accessToken.ExpiresOn+" "+timezone)
	if err != nil {
		slog.Error("not able to parse time", err)
		return loginStatus, err
	}

	slog.Debug("expiry time on access token" + t.String())
	slog.Debug("current time is " + time.Now().String())

	if t.After(time.Now()) {
		loginStatus.IsLoggedIn = true
		return loginStatus, nil
	} else {
		slog.Info("It seems the access token is expired. please login again.")
	}

	loginStatus.IsLoggedIn = false
	return loginStatus, nil
}
