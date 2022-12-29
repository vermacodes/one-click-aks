package entity

type Upgrade struct {
	IsPreview           interface{} `json:"isPreview"`
	OrchestratorType    string      `json:"orchestratorType"`
	OrchestratorVersion string      `json:"orchestratorVersion"`
}

type Orchestrator struct {
	Default             interface{} `json:"default"`
	IsPreview           interface{} `json:"isPreview"`
	OrchestratorType    string      `json:"orchestratorType"`
	OrchestratorVersion string      `json:"orchestratorVersion"`
	Upgrades            []Upgrade   `json:"upgrades"`
}

type KubernetesOrchestrator struct {
	ID            string         `json:"id"`
	Name          string         `json:"name"`
	Orchestrators []Orchestrator `json:"orchestrators"`
	Type          string         `json:"type"`
}

type KVersionService interface {
	GetOrchestrator() (KubernetesOrchestrator, error)
	GetDefaultVersion() string
}

type KVersionRepository interface {
	//GetDefaultOrchestrator(string) (string, error)
	GetOrchestrator(string) (string, error)
}
