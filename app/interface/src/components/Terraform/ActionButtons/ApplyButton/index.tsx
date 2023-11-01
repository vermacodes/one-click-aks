import React, { useContext } from "react";
import { FaRocket } from "react-icons/fa";
import { ButtonVariant, DeploymentType, Lab } from "../../../../dataStructures";
import { useSetLogs } from "../../../../hooks/useLogs";
import { usePreference } from "../../../../hooks/usePreference";
import { useApply } from "../../../../hooks/useTerraform";
import Button from "../../../UserInterfaceComponents/Button";
import {
  useGetMyDeployments,
  useUpsertDeployment,
} from "../../../../hooks/useDeployments";
import { useTerraformWorkspace } from "../../../../hooks/useWorkspace";
import {
  calculateNewEpochTimeForDeployment,
  getSelectedDeployment,
} from "../../../../utils/helpers";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ApplyButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: applyAsync } = useApply();
  const { actionStatus } = useContext(WebSocketContext);
  const { data: preference } = usePreference();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { mutate: upsertDeployment } = useUpsertDeployment();

  function updateDeploymentStatus(
    deployment: DeploymentType | undefined,
    status: DeploymentType["deploymentStatus"]
  ) {
    if (deployment !== undefined) {
      upsertDeployment({
        ...deployment,
        deploymentStatus: status,
        deploymentAutoDeleteUnixTime:
          calculateNewEpochTimeForDeployment(deployment),
      });
    }
  }

  function onClickHandler() {
    if (
      lab === undefined ||
      terraformWorkspaces === undefined ||
      deployments === undefined
    ) {
      return;
    }
    // update lab's azure region based on users preference
    if (lab.template !== undefined && preference !== undefined) {
      lab.template.resourceGroup.location = preference.azureRegion;
    }

    // reset logs
    setLogs({ logs: "" });

    const deployment = getSelectedDeployment(deployments, terraformWorkspaces);
    updateDeploymentStatus(deployment, "Deployment In Progress");

    // apply terraform
    applyAsync(lab)
      .then(() => {
        updateDeploymentStatus(deployment, "Deployment Completed");
      })
      .catch(() => {
        updateDeploymentStatus(deployment, "Deployment Failed");
      });
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={actionStatus.inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaRocket />
      </span>
      {children}
    </Button>
  );
}