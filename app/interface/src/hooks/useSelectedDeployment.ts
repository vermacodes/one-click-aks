import { useMemo } from "react";
import { useGetMyDeployments } from "./useDeployments";
import { DeploymentType } from "../dataStructures";
import { useGetSelectedTerraformWorkspace } from "./useGetSelectedTerraformWorkspace";

export function useSelectedDeployment() {
  const { data: deployments } = useGetMyDeployments();
  const { selectedTerraformWorkspace } = useGetSelectedTerraformWorkspace();

  function getSelectedDeployment(
    deployments: DeploymentType[]
  ): DeploymentType | undefined {
    if (selectedTerraformWorkspace === undefined) {
      return undefined;
    }

    var selectedDeployment = deployments.find(
      (deployment) =>
        deployment.deploymentWorkspace === selectedTerraformWorkspace?.name
    );
    if (selectedDeployment) {
      return selectedDeployment;
    } else {
      return undefined;
    }
  }

  const selectedDeployment = useMemo(() => {
    if (!deployments) {
      return undefined;
    }
    return getSelectedDeployment(deployments);
  }, [deployments, selectedTerraformWorkspace]);

  return { selectedDeployment };
}
