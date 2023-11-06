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
		// Iterate over PatchVersions
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
		// Iterate over PatchVersions
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
		// Iterate over PatchVersions
		for patchVersion := range v.PatchVersions {
			slog.Debug("Patch Version" + patchVersion)
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

	// Filter out preview versions and sort the remaining versions in descending order
	var sortedValues []entity.Value
	for _, v := range o.Values {
		if v.IsPreview != nil && *v.IsPreview {
			continue
		}
		sortedValues = append(sortedValues, v)
	}
	sort.Slice(sortedValues, func(i, j int) bool {
		return versionGreater(sortedValues[i].Version, sortedValues[j].Version)
	})

	// If there are at least two versions, select the second from top minor version
	if len(sortedValues) >= 2 {
		secondTopMinorVersion := sortedValues[1]

		// Get the patch versions of the second from top minor version
		var patchVersions []string
		for patchVersion := range secondTopMinorVersion.PatchVersions {
			patchVersions = append(patchVersions, patchVersion)
		}

		// Sort the patch versions in descending order
		sort.Slice(patchVersions, func(i, j int) bool {
			return versionGreater(patchVersions[i], patchVersions[j])
		})

		// If there are any patch versions, return the highest one
		if len(patchVersions) > 0 {
			return patchVersions[0]
		}
	}

	slog.Error("not able to get default version", nil)
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
