import React, { useContext } from "react";
import { FaRocket } from "react-icons/fa";
import {
  ButtonVariant,
  DeploymentType,
  Lab,
  TerraformOperation,
} from "../../../../dataStructures";
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
import { toast } from "react-toastify";
import { axiosInstance } from "../../../../utils/axios-interceptors";

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
        if (terraformOp.status === "Deployment Completed") {
          toast.success("Deployment Completed"),
            {
              autoClose: 5000,
            };
          updateDeploymentStatus(deployment, "Deployment Completed");
        } else if (terraformOp.status === "Deployment Failed") {
          toast.error("Deployment Failed"),
            {
              autoCLose: 10000,
            };
          updateDeploymentStatus(deployment, "Deployment Failed");
        }
        clearInterval(intervalId);
      }
    }, 10000);
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

    if (lab.template !== undefined && preference !== undefined) {
      lab.template.resourceGroup.location = preference.azureRegion;
    }

    setLogs({ logs: "" });

    const deployment = getSelectedDeployment(deployments, terraformWorkspaces);
    if (deployment === undefined) {
      toast.error(
        "No deployment selected. Try 'Reset Server Cache' from settings."
      );
      return;
    }

    updateDeploymentStatus(deployment, "Deployment In Progress");

    const response = toast.promise(applyAsync(lab), {
      pending: "Submitting Apply Operation...",
      success: {
        render(data: any) {
          return `Apply operation submitted.`;
        },
        autoClose: 5000,
      },
      error: {
        render(data: any) {
          return `Apply Failed. ${data.data.data}`;
        },
        autoClose: 10000,
      },
    });

    response
      .then((data) => {
        checkDeploymentStatus(data.data, deployment);
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
