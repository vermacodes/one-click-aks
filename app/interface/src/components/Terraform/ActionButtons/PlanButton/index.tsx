import React, { useContext } from "react";
import { FaFile } from "react-icons/fa";
import {
  ButtonVariant,
  DeploymentType,
  Lab,
  TerraformOperation,
} from "../../../../dataStructures";
import { useSetLogs } from "../../../../hooks/useLogs";
import { usePreference } from "../../../../hooks/usePreference";
import { usePlan } from "../../../../hooks/useTerraform";
import Button from "../../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../../WebSocketContext";
import { toast } from "react-toastify";
import {
  calculateNewEpochTimeForDeployment,
  getSelectedDeployment,
} from "../../../../utils/helpers";
import {
  useGetMyDeployments,
  usePatchDeployment,
} from "../../../../hooks/useDeployments";
import { axiosInstance } from "../../../../utils/axios-interceptors";
import { useTerraformWorkspace } from "../../../../hooks/useWorkspace";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function PlanButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: planAsync } = usePlan();
  const { actionStatus, setActionStatus } = useContext(WebSocketContext);
  const { data: preference } = usePreference();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { mutate: patchDeployment } = usePatchDeployment();

  function updateDeploymentStatus(
    deployment: DeploymentType | undefined,
    status: DeploymentType["deploymentStatus"]
  ) {
    if (deployment !== undefined) {
      patchDeployment({
        ...deployment,
        deploymentStatus: status,
      });
    }
  }

  async function checkStatusAsync(
    operationId: string
  ): Promise<TerraformOperation> {
    try {
      const response = await axiosInstance.get(
        `/terraform/status/${operationId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async function checkDeploymentStatus(
    operation: TerraformOperation,
    deployment: DeploymentType
  ) {
    const intervalId = setInterval(async () => {
      const terraformOp = await checkStatusAsync(operation.operationId);
      if (!terraformOp.inProgress) {
        if (terraformOp.status === "Plan Completed") {
          toast.success("Plan Completed"),
            {
              autoClose: 5000,
            };
          updateDeploymentStatus(deployment, "Plan Completed");
        } else if (terraformOp.status === "Plan Failed") {
          toast.error("Plan Failed"),
            {
              autoCLose: 10000,
            };
          updateDeploymentStatus(deployment, "Plan Failed");
        }
        clearInterval(intervalId);
      }
    }, 10000);
  }

  function onClickHandler() {
    // Apply Preference
    if (
      lab === undefined ||
      lab.template === undefined ||
      deployments === undefined ||
      terraformWorkspaces === undefined
    ) {
      toast.error(
        "Something isn't right. Try 'Reset Server Cache' from settings."
      );
      return;
    }

    // Set the location to the preference
    if (preference !== undefined) {
      lab.template.resourceGroup.location = preference.azureRegion;
    }

    // reset logs
    setLogs({ logs: "" });

    const deployment = getSelectedDeployment(deployments, terraformWorkspaces);
    if (deployment === undefined) {
      toast.error(
        "No deployment selected. Try 'Reset Server Cache' from settings."
      );
      return;
    }

    // submit plan operation
    const response = toast.promise(planAsync(lab), {
      pending: "Submitting plan operation...",
      success: {
        render(data: any) {
          return `Plan submitted.`;
        },
        autoClose: 5000,
      },
      error: {
        render(data: any) {
          return `Plan failed: ${data.data.data}`;
        },
        autoClose: 10000,
      },
    });

    response
      .then((data) => {
        checkDeploymentStatus(data.data, deployment);
      })
      .catch(() => {
        updateDeploymentStatus(deployment, "Plan Failed");
      });
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      tooltipMessage="Preview the changes before deploy."
      tooltipDelay={1000}
      disabled={actionStatus.inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaFile />
      </span>
      {children}
    </Button>
  );
}
