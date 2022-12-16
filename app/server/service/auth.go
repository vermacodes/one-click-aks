package service

import (
	"bufio"
	"fmt"
	"io"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type authService struct {
	authRepository      entity.AuthRepository
	logStreamService    entity.LogStreamService
	actionStatusService entity.ActionStatusService
}

func NewAuthService(authRepository entity.AuthRepository, logStreamService entity.LogStreamService, actionStatusService entity.ActionStatusService) entity.AuthService {
	return &authService{
		authRepository:      authRepository,
		logStreamService:    logStreamService,
		actionStatusService: actionStatusService,
	}
}

func (a *authService) Login() (entity.LoginStatus, error) {
	loginStatus := entity.LoginStatus{}
	cmd, rPipe, wPipe, err := a.authRepository.Login()
	if err != nil {
		slog.Error("not able to run login command", err)
		return loginStatus, err
	}

	// GO routine that takes care of running command and moving logs to redis.
	go func(input io.ReadCloser) {
		in := bufio.NewScanner(input)
		logStream, err := a.logStreamService.GetLogs()
		if err != nil {
			slog.Error("not able to get existing logs. Resetting", err)
			logStream.Logs = ""
		}
		for in.Scan() {
			logStream.Logs = logStream.Logs + fmt.Sprintf("%s\n", in.Text()) // Appening 'end' to signal stream end.
			a.logStreamService.SetLogs(logStream)
		}
		input.Close()
	}(rPipe)

	cmd.Wait()
	wPipe.Close()
	a.logStreamService.EndLogStream()

	actionStaus := entity.ActionStatus{}
	actionStaus.InProgress = false
	a.actionStatusService.SetActionStatus(actionStaus)

	loginStatus.IsLoggedIn = true
	return loginStatus, nil
}
