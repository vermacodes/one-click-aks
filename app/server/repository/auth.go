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
