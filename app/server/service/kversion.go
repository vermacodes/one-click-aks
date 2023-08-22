package service

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

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

func (k *kVersionService) GetOrchestrator() (entity.KubernetesVersions, error) {

	kubernetesVersions := entity.KubernetesVersions{}

	preference, err := k.preferenceService.GetPreference()
	if err != nil {
		slog.Error("not able to get user's preference", err)
		return kubernetesVersions, err
	}

	out, err := k.kVersionRepository.GetOrchestrator(preference.AzureRegion)
	if err != nil {
		slog.Error("not able to get orchestrator", err)
		return kubernetesVersions, err
	}

	if err := json.Unmarshal([]byte(out), &kubernetesVersions); err != nil {
		slog.Error("not able to unmarshal output from cli to object", err)
		return kubernetesVersions, err
	}

	return kubernetesVersions, nil
}

func (k *kVersionService) GetDefaultVersion() string {
	o, err := k.GetOrchestrator()
	if err != nil {
		slog.Error("not able to get orchestrator", err)
		return ""
	}

	defaultVersionInt := 0
	defaultVersionString := ""

	// return the most recent version.
	for _, v := range o.Values {
		// Itrate over PatchVersions
		for patchVersion := range v.PatchVersions {
			versionParts := strings.Split(patchVersion, ".")

			if len(versionParts) < 3 {
				slog.Error("invalid version string", err)
				return ""
			}

			major, err := strconv.Atoi(versionParts[0])
			if err != nil {
				fmt.Println("Error:", err)
				return ""
			}

			minor, err := strconv.Atoi(versionParts[1])
			if err != nil {
				fmt.Println("Error:", err)
				return ""
			}

			patch, err := strconv.Atoi(versionParts[2])
			if err != nil {
				fmt.Println("Error:", err)
				return ""
			}

			thisVersionInt := major*10000 + minor*100 + patch

			if thisVersionInt > defaultVersionInt {
				defaultVersionString = patchVersion
			}

		}
	}
	return defaultVersionString
}
