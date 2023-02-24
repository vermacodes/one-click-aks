package service

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type authService struct {
	authRepository      entity.AuthRepository
	logStreamService    entity.LogStreamService
	actionStatusService entity.ActionStatusService
	loggingService      entity.LoggingService
}

func NewAuthService(authRepository entity.AuthRepository, logStreamService entity.LogStreamService, actionStatusService entity.ActionStatusService, loggingService entity.LoggingService) entity.AuthService {
	return &authService{
		authRepository:      authRepository,
		logStreamService:    logStreamService,
		actionStatusService: actionStatusService,
		loggingService:      loggingService,
	}
}

func (a *authService) Login() (entity.LoginStatus, error) {

	loginStatus := entity.LoginStatus{}

	// Set action status to start.
	actionStaus, err := a.actionStatusService.GetActionStatus()
	if err != nil {
		slog.Error("not able to get current action status", err)

		// Defaulting to no action
		actionStaus := entity.ActionStatus{
			InProgress: false,
		}
		if err := a.actionStatusService.SetActionStatus(actionStaus); err != nil {
			slog.Error("not able to set default action status.", err)
		}
	}

	if actionStaus.InProgress {
		slog.Error("Error", errors.New("action already in progress"))
		return loginStatus, errors.New("action already in progress")
	}

	actionStaus.InProgress = true
	a.actionStatusService.SetActionStatus(actionStaus)

	// Stop any existing running login attempt before a new attempt.
	if err := a.StopRunningLoginAttempt(); err != nil {
		slog.Error("not able to stop running login attempt. this is probably cause there isn't antyhing running.", err)
	}

	// Begin Authentication
	cmd, rPipe, wPipe, err := a.authRepository.Login()
	if err != nil {
		slog.Error("not able to run login command", err)
		return loginStatus, err
	}

	// GO routine that takes care of running command and moving logs to redis.
	go func(input io.ReadCloser) {
		in := bufio.NewScanner(input)
		logStream := entity.LogStream{
			Logs:        "",
			IsStreaming: true,
		}
		for in.Scan() {
			logStream.Logs = logStream.Logs + fmt.Sprintf("%s\n", in.Text()) // Appening 'end' to signal stream end.
			a.logStreamService.SetLogs(logStream)
		}
		input.Close()
	}(rPipe)

	cmd.Wait()
	wPipe.Close()

	go func() {
		//FIXME: This solution is stupid, fix it.
		slog.Info("Ending logs stream after login in 5 seconds.")
		// time.Sleep(5 * time.Second)
		a.logStreamService.EndLogStream()
	}()

	// End action satus.
	actionStaus.InProgress = false
	a.actionStatusService.SetActionStatus(actionStaus)

	// Stop any stale login attempts.
	if err := a.StopRunningLoginAttempt(); err != nil {
		return loginStatus, err
	}

	// Delete all cache from redis.
	slog.Info("deleting all redis cache on authentication")
	if err := a.authRepository.DeleteAllCache(); err != nil {
		slog.Error("not able to delete all cache from redis", err)
	}

	// Login Record
	account, err := a.GetAccount()
	if err != nil {
		slog.Error("Not able to get Account", err)
	} else {

		a.loggingService.LoginRecord(account.User)
	}

	loginStatus.IsLoggedIn = true
	return loginStatus, nil
}

func (a *authService) StopRunningLoginAttempt() error {
	if err := a.authRepository.StopRunningLoginAttempt(); err != nil {
		slog.Error("Not able to stop running login attempt", err)
		return err
	}

	return nil
}

func (a *authService) GetLoginStatus() (entity.LoginStatus, error) {
	loginStatus := entity.LoginStatus{}
	accessToken := entity.AccessToken{}

	out, err := a.authRepository.GetLoginStatusFromRedis()
	if err == nil {
		slog.Debug("login status found in redis.")

		if err = json.Unmarshal([]byte(out), &accessToken); err != nil {
			slog.Error("not able to marshal access token from cli to object", err)
			return loginStatus, err
		}

		loginStatus, err := helperIsTokenValid(accessToken)
		if err != nil || loginStatus.IsLoggedIn {
			return loginStatus, err
		} else {
			slog.Info("token in redis is expired")
		}
	} else {
		slog.Info("login status not found in redis")
	}

	// Following will be executed if the login status was not found in redis or the token is expired.

	// Getting access token from CLI
	slog.Info("running CLI command to get token")
	out, err = a.authRepository.GetLoginStatus()
	if err != nil || out == "" {
		slog.Error("not able to run azure cli command to get access token", err)
		return loginStatus, err
	}

	if err = json.Unmarshal([]byte(out), &accessToken); err != nil {
		slog.Error("not able to marshal access token from cli to object", err)
		return loginStatus, err
	}

	// Since all went well so far, set login status in redis.
	a.authRepository.SetLoginStatusInRedis(out)

	return helperIsTokenValid(accessToken)

}

func (a *authService) GetAuthToken() (string, error) {
	out, err := a.authRepository.GetAuthToken()
	if err != nil {
		slog.Error("not able to get auth token", err)
	}
	return out, err
}

func (a *authService) GetAccount() (entity.Account, error) {
	account := entity.Account{}

	out, err := a.authRepository.GetAccountFromRedis()
	if err == nil {
		slog.Info("current account found in redis.")
		if jsonErr := json.Unmarshal([]byte(out), &account); err != nil {
			slog.Error("unable to unmarshal output of cli to object", err)
			return account, jsonErr
		}
		return account, err
	}

	// Following will be executed only if account not found in redis.
	slog.Info("account not found in redis. running cli command")
	out, err = a.authRepository.GetAccount()
	if err != nil || out == "" {
		slog.Error("not able to run cli command to get current account", err)
		return account, err
	}

	if err := json.Unmarshal([]byte(out), &account); err != nil {
		slog.Error("unable to unmarshal output of cli to object", err)
		return account, err
	}

	// Set account in redis.
	if err := a.authRepository.SetAccountInRedis(out); err != nil {
		slog.Error("not able to set account in redis.", err)
	}

	return account, nil
}

func (a *authService) GetAccounts() ([]entity.Account, error) {
	accounts := []entity.Account{}

	out, err := a.authRepository.GetAccountsFromRedis()
	if err == nil {
		slog.Info("current account found in redis.")
		if jsonErr := json.Unmarshal([]byte(out), &accounts); err != nil {
			slog.Error("unable to unmarshal output of cli to object", err)
			return accounts, jsonErr
		}
		return accounts, err
	}

	// Following will be executed only if accounts not found in redis.
	slog.Info("accounts not found in redis. running cli command")
	out, err = a.authRepository.GetAccounts()
	if err != nil || out == "" {
		slog.Error("not able to run cli command to get current accounts", err)
		return accounts, err
	}

	if err := json.Unmarshal([]byte(out), &accounts); err != nil {
		slog.Error("unable to unmarshal output of cli to object", err)
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

	// Remove now stale info from redis.
	if err := a.authRepository.DeleteAccountFromRedis(); err != nil {
		slog.Error("not abl to delete account from redis. this will lead to stale information", err)
		return err
	}
	if err := a.authRepository.DeleteAccountsFromRedis(); err != nil {
		slog.Error("not abl to delete accounts from redis. this will lead to stale information", err)
		return err
	}

	return nil
}

func (a *authService) GetPriveledges() (entity.Priviledge, error) {
	privilegde := entity.Priviledge{}

	account, err := a.GetAccount()
	if err != nil {
		slog.Error("not able to get current account", err)
		return privilegde, err
	}

	isAdmin, err := a.authRepository.IsAdmin(account.User.Name)
	if err != nil {
		slog.Error("not able to get admin status", err)
		return privilegde, err
	}

	isMentor, err := a.authRepository.IsMentor(account.User.Name)
	if err != nil {
		slog.Error("not able to get mentor status", err)
		return privilegde, err
	}

	privilegde.User = account.User.Name
	privilegde.IsAdmin = isAdmin
	privilegde.IsMentor = isMentor

	return privilegde, nil
}

func (a *authService) Logout() error {
	if err := a.authRepository.Logout(); err != nil {
		slog.Error("not able to logout", err)
		return err
	}

	return nil
}

func (a *authService) ConfigureServicePrincipal() (entity.ServicePrincipalConfig, error) {
	servicePrincipalConfig := entity.ServicePrincipalConfig{}

	// Get service principal config from redis.
	cmd, rPipe, wPipe, err := a.authRepository.ConfigureServicePrincipal()
	if err != nil {
		slog.Error("not able to run cli command to configure service principal", err)
		return servicePrincipalConfig, err
	}

	// GO routine that takes care of running command and moving logs to redis.
	go func(input io.ReadCloser) {
		in := bufio.NewScanner(input)

		// This will continue adding logs to existing logs.
		// If couldn't get existing logs, then just start from scratch.
		// If existing logs are not supposed to be shown, then client is expected to reset
		// before using APIs.
		logStream, err := a.logStreamService.GetLogs()
		if err != nil {
			slog.Error("not able to get logs", err)
			logStream = entity.LogStream{
				IsStreaming: true,
				Logs:        "",
			}
		}

		for in.Scan() {
			logStream.Logs = logStream.Logs + fmt.Sprintf("%s\n", in.Text()) // Appening 'end' to signal stream end.
			a.logStreamService.SetLogs(logStream)
		}
		input.Close()
	}(rPipe)

	err = cmd.Wait()
	wPipe.Close()
	a.logStreamService.EndLogStream()
	if err == nil {
		servicePrincipalConfig.IsServicePrincipalConfigured = true
	}
	return servicePrincipalConfig, err
}

func helperIsTokenValid(accessToken entity.AccessToken) (entity.LoginStatus, error) {
	loginStatus := entity.LoginStatus{}

	timezone, _ := time.Now().Zone()
	slog.Info("Timezone " + timezone)

	layout := "2006-01-02 15:04:05.000000 MST"

	t, err := time.Parse(layout, accessToken.ExpiresOn+" "+timezone)
	if err != nil {
		slog.Error("not able to parse time", err)
		return loginStatus, err
	}

	slog.Info("expiry time on access token" + t.String())
	slog.Info("current time is " + time.Now().String())

	if t.After(time.Now()) {
		loginStatus.IsLoggedIn = true
		return loginStatus, nil
	} else {
		slog.Info("It seems the access token is expired. please login again.")
	}

	loginStatus.IsLoggedIn = false
	return loginStatus, nil
}
