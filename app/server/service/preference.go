package service

import (
	"encoding/json"

	"github.com/vermacodes/one-click-aks/app/server/entity"
	"golang.org/x/exp/slog"
)

type preferenceService struct {
	prefernceRepository   entity.PreferenceRepository
	storageAccountService entity.StorageAccountService
}

func NewPreferenceService(preferenceRepo entity.PreferenceRepository, storageAccountService entity.StorageAccountService) entity.PreferenceService {
	return &preferenceService{
		prefernceRepository:   preferenceRepo,
		storageAccountService: storageAccountService,
	}
}

func (p *preferenceService) GetPreference() (entity.Preference, error) {
	preference := entity.Preference{}

	preferenceString, err := p.prefernceRepository.GetPreferenceFromRedis()
	if err == nil {
		slog.Info("preferene found in redis.")
		errJson := json.Unmarshal([]byte(preferenceString), &preference)
		if errJson == nil {
			return preference, errJson
		}
		slog.Error("not able to marshal the preference in redis", errJson)
	}

	// Rest of functin will execute if issue in getting preference from redis.

	storageAccountName, err := p.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return preference, err
	}

	preferenceString, err = p.prefernceRepository.GetPreferenceFromBlob(storageAccountName)
	if err != nil {
		slog.Error("not able to get preference from storage account, fall back to default", err)

		// Stting and returning default preference
		if err := p.SetPreference(defaultPreference()); err != nil {
			slog.Error("not able to set default preference in storage", err)
		}
		return defaultPreference(), nil
	}

	// Add preference to redis.
	if err := p.prefernceRepository.PutPreferenceInRedis(preferenceString); err != nil {
		slog.Error("not able to put preference in redis.", err)
	}

	if err := json.Unmarshal([]byte(preferenceString), &preference); err != nil {
		slog.Error("not able to unmarshal prefrence from blob to object", err)
		return preference, err
	}

	return preference, nil
}

func (p *preferenceService) SetPreference(preference entity.Preference) error {
	storageAccountName, err := p.storageAccountService.GetStorageAccountName()
	if err != nil {
		slog.Error("not able to get storage account name", err)
		return err
	}
	slog.Debug("storage account name -> " + storageAccountName)

	out, err := json.Marshal(preference)
	if err != nil {
		slog.Error("Error marshaling json", err)
		return err
	}
	slog.Debug("prefrence -> " + string(out))

	if err := p.prefernceRepository.PutPreferenceInBlob(string(out), storageAccountName); err != nil {
		slog.Error("not able to put preference in blob", err)
		return err
	}

	if err := p.prefernceRepository.PutPreferenceInRedis(string(out)); err != nil {
		slog.Error("not able to put preference in redis", err)
		return err
	}

	return nil
}

func defaultPreference() entity.Preference {
	return entity.Preference{
		AzureRegion: "East US",
	}
}
