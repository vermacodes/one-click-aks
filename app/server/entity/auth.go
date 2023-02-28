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

type LoginMessage struct {
	LoginMessage string `json:"loginMessage"`
}

type AccessToken struct {
	AccessToken  string `json:"accessToken"`
	ExpiresOn    string `json:"expiresOn"`
	Subscription string `json:"subscription"`
	Tenant       string `json:"tenant"`
	TokenType    string `json:"tokenType"`
}

type Priviledge struct {
	User     string `json:"user"`
	IsAdmin  bool   `json:"isAdmin"`
	IsMentor bool   `json:"isMentor"`
}

type ServicePrincipalConfig struct {
	IsServicePrincipalConfigured bool `json:"isServicePrincipalConfigured"`
}

type AuthService interface {
	ServicePrincipalLogin() (LoginStatus, error)
	ServicePrincipalLoginStatus() (LoginStatus, error)

	// Login() (LoginStatus, error)
	// Logout() error
	// StopRunningLoginAttempt() error
	// GetAuthToken() (string, error)
	// GetLoginStatus() (LoginStatus, error)
	// GetAccount() (Account, error)
	GetAccounts() ([]Account, error)
	SetAccount(account Account) error
	// GetPriveledges() (Priviledge, error)
	// ConfigureServicePrincipal() (ServicePrincipalConfig, error)
}

type AuthRepository interface {
	ServicePrincipalLogin() (string, error)
	ServicePrincipalLoginStatus() (string, error)
	GetServicePrincipalLoginStatusFromRedis() (string, error)
	SetServicePrincipalLoginStatusInRedis(val string) error
	// Login() (*exec.Cmd, *os.File, *os.File, error)
	// Logout() error
	// DeleteAllCache() error

	// GetLoginStatus() (string, error)
	// GetLoginStatusFromRedis() (string, error)
	// SetLoginStatusInRedis(string) error

	// StopRunningLoginAttempt() error
	// // DeleteLoginStatusFromRedis() error

	// GetAuthToken() (string, error)
	// GetAccount() (string, error)
	// GetAccountFromRedis() (string, error)
	// SetAccountInRedis(val string) error

	GetAccounts() (string, error)
	GetAccountsFromRedis() (string, error)
	SetAccountsInRedis(val string) error

	SetAccount(accountId string) error
	// DeleteAccountFromRedis() error
	DeleteAccountsFromRedis() error

	// IsAdmin(string) (bool, error)
	// IsMentor(string) (bool, error)

	// ConfigureServicePrincipal() (*exec.Cmd, *os.File, *os.File, error)
}
