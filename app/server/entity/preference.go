package entity

type Preference struct {
	AzureRegion string `json:"azureRegion"`
}

type PreferenceService interface {
	GetPreference() (Preference, error)
	SetPreference(prefence Preference) error
}

type PreferenceRepository interface {
	GetPreferenceFromBlob(storageAccountName string) (string, error)
	PutPreferenceInBlob(val string, storageAccountName string) error
	GetPreferenceFromRedis() (string, error)
	PutPreferenceInRedis(val string) error
}
