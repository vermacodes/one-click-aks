package repository

import (
	"os"

	"golang.org/x/exp/slog"
)

func setEnvironmentVariable(key string, value string) {
	err := os.Setenv(key, value)
	if err != nil {
		slog.Error("not able to set environment variable", err)
	}
}
