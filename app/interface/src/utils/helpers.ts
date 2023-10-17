import { DeploymentType, TerraformWorkspace } from "../dataStructures";

// Function returns the new epoch time for deployment destroy time.
export function calculateNewEpochTimeForDeployment(deployment: DeploymentType) {
    
    if (deployment.deploymentAutoDelete === false) {
      return 0
    }

    const now = new Date();
    // Get epoch tiem in seconds
    const epochTime = Math.floor(now.getTime() / 1000);

    return deployment.deploymentLifespan + epochTime;
}

// Function returns the selected terraform workspace.
export function getSelectedTerraformWorkspace(terraformWorkspaces: TerraformWorkspace[]) {
    var selectedWorkspace = terraformWorkspaces.find((workspace) => workspace.selected);
    if (selectedWorkspace) {
        return selectedWorkspace;
    } else {
        return undefined;
    }
}

// Function returns the selected deployment.
export function getSelectedDeployment(deployments: DeploymentType[], terraformWorkspaces: TerraformWorkspace[]): DeploymentType | undefined {
    var selectedTerraformWorksapce = getSelectedTerraformWorkspace(terraformWorkspaces);

    if (selectedTerraformWorksapce === undefined) {
        return undefined;
    }

    var selectedDeployment = deployments.find((deployment) => deployment.deploymentWorkspace === selectedTerraformWorksapce?.name);
    if (selectedDeployment) {
        return selectedDeployment;
    } else {
        return undefined;
    }
}

// Function returns the time when the deployment will be destroyed in user's local time.
export function getDeploymentDestroyTime(deployment: DeploymentType) {
    if (deployment.deploymentAutoDelete === false) {
        return "Never";
    }

    const epochTime = deployment.deploymentAutoDeleteUnixTime;
    const date = new Date(epochTime * 1000);
    return date.toLocaleString();
}

// Function returns the time remaining in hours, minutes and seconds for the deployment to be destroyed based on user's local time.
export function getDeploymentDestroyTimeRemaining(deployment: DeploymentType) {
    if (deployment.deploymentAutoDelete === false) {
        return "Never";
    }

    const epochTime = deployment.deploymentAutoDeleteUnixTime;
    const now = new Date();
    const timeRemaining = epochTime - Math.floor(now.getTime() / 1000);

    if (timeRemaining <= 0) {
        return "0h 0m";
    }

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = Math.floor((timeRemaining % 3600) % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
}