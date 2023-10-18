package entity

type User struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Tenant struct {
	TenantId string `json:"tenantId"`
}

type Account struct {
	EnvironmentName  string   `json:"environmentName"`
	HomeTenantId     string   `json:"homeTenantId"`
	Id               string   `json:"id"`
	IsDefault        bool     `json:"isDefault"`
	ManagedByTenants []Tenant `json:"managedByTenants"`
	Name             string   `json:"name"`
	State            string   `json:"state"`
	TenantId         string   `json:"tenantId"`
	User             User     `json:"user"`
}

type LoginStatus struct {
	IsLoggedIn bool `json:"isLoggedIn"`
}

type AccessToken struct {
	AccessToken  string `json:"accessToken"`
	ExpiresOn    string `json:"expiresOn"`
	Subscription string `json:"subscription"`
	Tenant       string `json:"tenant"`
	TokenType    string `json:"tokenType"`
}

type ServicePrincipalConfig struct {
	IsServicePrincipalConfigured bool `json:"isServicePrincipalConfigured"`
}

type AuthService interface {
	ServicePrincipalLogin() (LoginStatus, error)
	ServicePrincipalLoginStatus() (LoginStatus, error)

	GetAccounts() ([]Account, error)
	GetActiveAccount() (Account, error)
	SetAccount(account Account) error
}

type AuthRepository interface {
	ServicePrincipalLogin() (string, error)
	ServicePrincipalLoginStatus() (string, error)
	GetServicePrincipalLoginStatusFromRedis() (string, error)
	SetServicePrincipalLoginStatusInRedis(val string) error

	GetAccounts() (string, error)
	GetAccountsFromRedis() (string, error)
	SetAccountsInRedis(val string) error

	SetAccount(accountId string) error
	DeleteAccountsFromRedis() error
}
