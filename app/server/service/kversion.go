package service

import (
	"encoding/json"
	"fmt"
	"sort"
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

func (k *kVersionService) GetMostRecentVersion() string {
	o, err := k.GetOrchestrator()
	if err != nil {
		slog.Error("not able to get orchestrator", err)
		return ""
	}

	mostRecentVersionInt := 0
	mostRecentVersionString := ""

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

			if thisVersionInt > mostRecentVersionInt {
				mostRecentVersionString = patchVersion
				mostRecentVersionInt = thisVersionInt
			}

		}
	}
	return mostRecentVersionString
}

func (k *kVersionService) GetOldestVersion() string {
	o, err := k.GetOrchestrator()
	if err != nil {
		slog.Error("not able to get orchestrator", err)
		return ""
	}

	oldestVersionInt := 0
	oldestVersionString := ""

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

			if thisVersionInt > oldestVersionInt {
				oldestVersionString = patchVersion
				oldestVersionInt = thisVersionInt
			}

		}
	}
	return oldestVersionString
}

func (k *kVersionService) DoesVersionExist(version string) bool {
	o, err := k.GetOrchestrator()
	if err != nil {
		slog.Error("not able to get orchestrator", err)
		return false
	}

	// return the most recent version.
	for _, v := range o.Values {
		// Itrate over PatchVersions
		for patchVersion := range v.PatchVersions {
			slog.Debug("Patch Verison" + patchVersion)
			if patchVersion == version {
				return true
			}
		}
	}
	return false
}

func (k *kVersionService) GetDefaultVersion() string {
	o, err := k.GetOrchestrator()
	if err != nil {
		slog.Error("not able to get orchestrator", err)
		return ""
	}

	var versions []string
	// Collect all versions in a slice.
	for _, v := range o.Values {
		for patchVersion := range v.PatchVersions {
			versions = append(versions, patchVersion)
		}
	}

	// Sort the versions in descending order.
	sort.Slice(versions, func(i, j int) bool {
		return versionGreater(versions[i], versions[j])
	})

	// Find the third largest version if it exists.
	if len(versions) >= 3 {
		return versions[2]
	}

	return ""
}

// Returns true if version a is greater than version b.
func versionGreater(a, b string) bool {
	versionPartsA := strings.Split(a, ".")
	versionPartsB := strings.Split(b, ".")

	for i := 0; i < 3; i++ {
		partA, _ := strconv.Atoi(versionPartsA[i])
		partB, _ := strconv.Atoi(versionPartsB[i])

		if partA != partB {
			return partA > partB
		}
	}

	return false
}
