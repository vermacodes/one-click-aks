package service

import (
	"encoding/json"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type kVersionService struct {
	kVersionRepository entity.KVersionRepository
	preferenceService  entity.PreferenceService
}

func NewKVersionService(kVersionRepo entity.KVersionRepository, preferenceService entity.PreferenceService) entity.KVersionService {
	return &kVersionService{
		kVersionRepository: kVersionRepo,
		preferenceService:  preferenceService,
	}
}

func (k *kVersionService) GetOrchestrator() (entity.KubernetesOrchestrator, error) {
	kubernetesOrchestrator := entity.KubernetesOrchestrator{}

	preference, err := k.preferenceService.GetPreference()
	if err != nil {
		slog.Error("not able to get user's preference", err)
		return kubernetesOrchestrator, err
	}

	out, err := k.kVersionRepository.GetOrchestrator(preference.AzureRegion)
	if err != nil {
		slog.Error("not able to get orchestrator", err)
		return kubernetesOrchestrator, err
	}

	if err := json.Unmarshal([]byte(out), &kubernetesOrchestrator); err != nil {
		slog.Error("not able to unmarshal output from cli to object", err)
		return kubernetesOrchestrator, err
	}

	return kubernetesOrchestrator, nil
}
