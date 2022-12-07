package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os/exec"

	"github.com/gin-gonic/gin"
)

type KubernetesOrchestrator struct {
	ID            string         `json:"id"`
	Name          string         `json:"name"`
	Orchestrators []Orchestrator `json:"orchestrators"`
	Type          string         `json:"type"`
}
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

func getDefaultKubernetesOrchestratorService(location string) (Orchestrator, error) {
	orchestrator := Orchestrator{}
	kubernetesOrchestrator, err := getKubernetesOrchestratorService(location)
	if err != nil {
		// TODO: Not sure how to recover here.
		return orchestrator, errors.New("Not able to get default Version")
		//panic(err)
	}
	for _, orchestrator := range kubernetesOrchestrator.Orchestrators {
		if orchestrator.Default != nil {
			return orchestrator, nil
		}
	}
	return orchestrator, errors.New("Not able to get default Version")
}

func getKubernetesOrchestratorService(location string) (KubernetesOrchestrator, error) {

	kubernetesOrchestrators := KubernetesOrchestrator{}

	out, err := exec.Command("bash", "-c", "az aks get-versions --location '"+location+"' -o json").Output()
	if err != nil {
		log.Println("Not able to get the kubernetes versions for location ", location, err)
		return kubernetesOrchestrators, err
	}

	if err := json.Unmarshal(out, &kubernetesOrchestrators); err != nil {
		log.Println("Not able to unmarshal output of command to object", err)
		return kubernetesOrchestrators, err
	}

	return kubernetesOrchestrators, nil
}

func getKubernetesOrchestratorController(c *gin.Context) {
	preference, err := getPreferenceService()
	if err != nil {
		log.Println("Not able to get preference", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	kubernetesOrchestrators, err := getKubernetesOrchestratorService(preference.AzureRegion)
	if err != nil {
		log.Println("Not able to get preference", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	c.IndentedJSON(http.StatusOK, kubernetesOrchestrators)
}

// Helper function to get the deafult version in prefered region.
func getDefaultKubernetesOrchestratorHelper() Orchestrator {
	orchestrator := Orchestrator{}
	azureRegion := "East US"
	preference, err := getPreferenceService()
	if err != nil {
		log.Println("Not able to get preference", err)
		log.Println("Defaulting to East US")
	} else {
		azureRegion = preference.AzureRegion
	}

	orchestrator, err = getDefaultKubernetesOrchestratorService(azureRegion)
	if err != nil {
		log.Println("Not able to get default orchestrator", err)
		return orchestrator
	}
	return orchestrator
}
