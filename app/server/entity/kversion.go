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
	Upgrades            []string    `json:"upgrades"`
}

type KubernetesOrchestrator struct {
	ID            string         `json:"id"`
	Name          string         `json:"name"`
	Orchestrators []Orchestrator `json:"orchestrators"`
	Type          string         `json:"type"`
}

type PatchVersions map[string]struct {
	Upgrades []string `json:"upgrades"`
}

type Capabilities struct {
	SupportPlan []string `json:"supportPlan"`
}

type Value struct {
	Capabilities  Capabilities  `json:"capabilities"`
	IsPreview     *bool         `json:"isPreview"`
	PatchVersions PatchVersions `json:"patchVersions"`
	Version       string        `json:"version"`
}

type KubernetesVersions struct {
	Values []Value `json:"values"`
}

type KVersionService interface {
	GetOrchestrator() (KubernetesVersions, error)
	GetDefaultVersion() string
	DoesVersionExist(string) bool
}

type KVersionRepository interface {
	//GetDefaultOrchestrator(string) (string, error)
	GetOrchestrator(string) (string, error)
}
