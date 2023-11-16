import React, { useContext } from "react";
import { FaRocket } from "react-icons/fa";
import { ButtonVariant, DeploymentType, Lab } from "../../../../dataStructures";
import { useSetLogs } from "../../../../hooks/useLogs";
import { usePreference } from "../../../../hooks/usePreference";
import { useApply } from "../../../../hooks/useTerraform";
import Button from "../../../UserInterfaceComponents/Button";
import {
  useGetMyDeployments,
  usePatchDeployment,
} from "../../../../hooks/useDeployments";
import { useTerraformWorkspace } from "../../../../hooks/useWorkspace";
import {
  calculateNewEpochTimeForDeployment,
  getSelectedDeployment,
} from "../../../../utils/helpers";
import { WebSocketContext } from "../../../../WebSocketContext";
import axios from "axios";
import { toast } from "react-toastify";
import { error } from "console";

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
  const { mutate: patchDeployment } = usePatchDeployment();

  function updateDeploymentStatus(
    deployment: DeploymentType | undefined,
    status: DeploymentType["deploymentStatus"]
  ) {
    if (deployment !== undefined) {
      const updatedDeployment = {
        ...deployment,
        deploymentStatus: status,
      };

      // if deployment is auto delete, update the unix time
      if (deployment.deploymentAutoDelete) {
        updatedDeployment.deploymentAutoDeleteUnixTime =
          calculateNewEpochTimeForDeployment(deployment);
      }

      patchDeployment(updatedDeployment);
    }
  }

  function onClickHandler() {
    if (
      lab === undefined ||
      terraformWorkspaces === undefined ||
      deployments === undefined
    ) {
      toast.error(
        "Something isn't right. Try 'Reset Server Cache' from settings."
      );
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
    const response = toast.promise(applyAsync(lab), {
      pending: "Applying...",
      success: {
        render(data: any) {
          return `Apply completed.`;
        },
        autoClose: 2000,
      },
      error: {
        render(data: any) {
          return `Apply failed. ${data.data.data}`;
        },
        autoClose: 10000,
      },
    });

    response
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
