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
		slog.Debug("preferene found in redis.")
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
	if err != nil || preferenceString == "" {
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
	if err != nil || string(out) == "" {
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

	// if err := p.labService.DeleteLabFromRedis(); err != nil {
	// 	slog.Error("not able to delete lab from redis as preference changed", err)
	// }
	// go func() {
	// 	if err := helperDeleteLabFromRedis(); err != nil {
	// 		slog.Error("not able to delte lab from redis", err)
	// 	}
	// }()

	return nil
}

func defaultPreference() entity.Preference {
	return entity.Preference{
		AzureRegion:        "East US",
		TerminalAutoScroll: false,
	}
}

// func helperDeleteLabFromRedis() error {
// 	req, err := http.NewRequest(http.MethodDelete, "http://localhost:8080/lab/redis", nil)
// 	if err != nil {
// 		slog.Error("not able to create request", err)
// 		return err
// 	}

// 	client := &http.Client{}

// 	resp, err := client.Do(req)
// 	if err != nil {
// 		slog.Error("not able to execute delete lab from redis.", err)
// 		return err
// 	}

// 	defer resp.Body.Close()

// 	if resp.StatusCode != 204 {
// 		error := errors.New("delete lab failure")
// 		slog.Error("not able to delete lab from redis", error)

// 		return error
// 	}

// 	return nil
// }
