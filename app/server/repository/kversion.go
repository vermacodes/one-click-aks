package repository

import (
	"os/exec"

	"github.com/vermacodes/one-click-aks/app/server/entity"
)

type kVersionRepository struct{}

func NewKVersionRepository() entity.KVersionRepository {
	return &kVersionRepository{}
}

func (k *kVersionRepository) GetOrchestrator(location string) (string, error) {
	out, err := exec.Command("bash", "-c", "az aks get-versions --location '"+location+"' -o json").Output()
	return string(out), err
}
