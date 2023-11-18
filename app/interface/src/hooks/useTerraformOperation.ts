import { useContext } from "react";
import {
  DeploymentStatus,
  DeploymentType,
  Lab,
  TerraformOperation,
  TerraformWorkspace,
} from "../dataStructures";
import {
  useDeleteDeployment,
  useGetMyDeployments,
  usePatchDeployment,
} from "./useDeployments";
import { useSetLogs } from "./useLogs";
import { useApply, useDestroy, usePlan } from "./useTerraform";
import { WebSocketContext } from "../WebSocketContext";
import { usePreference } from "./usePreference";
import { useTerraformWorkspace } from "./useWorkspace";
import { toast } from "react-toastify";
import { calculateNewEpochTimeForDeployment } from "../utils/helpers";
import { axiosInstance } from "../utils/axios-interceptors";
import { useSelectedDeployment } from "./useSelectedDeployment";

export function useTerraformOperation() {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: planAsync } = usePlan();
  const { mutateAsync: applyAsync } = useApply();
  const { mutateAsync: destroyAsync } = useDestroy();
  const { actionStatus } = useContext(WebSocketContext);
  const { data: preference } = usePreference();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { mutate: patchDeployment } = usePatchDeployment();
  const { mutateAsync: deleteDeploymentAsync } = useDeleteDeployment();
  const { selectedDeployment: deployment } = useSelectedDeployment();

  function updateDeploymentStatus(
    deployment: DeploymentType | undefined,
    status: DeploymentType["deploymentStatus"],
    extendLifespan: boolean
  ) {
    if (deployment !== undefined) {
      patchDeployment({
        ...deployment,
        deploymentStatus: status,
      });
    }

    if (extendLifespan && deployment?.deploymentAutoDelete) {
      patchDeployment({
        ...deployment,
        deploymentAutoDeleteUnixTime:
          calculateNewEpochTimeForDeployment(deployment),
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
    operationType: "plan" | "apply" | "destroy",
    operation: TerraformOperation,
    deployment: DeploymentType,
    completedStatus: DeploymentStatus,
    failedStatus: DeploymentStatus,
    extendLifespan: boolean,
    deleteWorkspace: boolean
  ) {
    const intervalId = setInterval(async () => {
      const terraformOp = await checkStatusAsync(operation.operationId);
      if (terraformOp === undefined || terraformOp.inProgress) {
        return;
      }

      if (terraformOp.status === completedStatus) {
        toast.success(completedStatus),
          {
            autoClose: 5000,
          };
        updateDeploymentStatus(deployment, completedStatus, extendLifespan);

        if (operationType === "destroy") {
          handleDeleteWorkspace(
            deployment,
            terraformWorkspaces,
            deleteWorkspace
          );
        }
      } else if (terraformOp.status === failedStatus) {
        toast.error(failedStatus),
          {
            autoCLose: 10000,
          };
        updateDeploymentStatus(deployment, failedStatus, extendLifespan);
      }
      clearInterval(intervalId);
    }, 5000);
  }

  function handleDeleteWorkspace(
    deployment: DeploymentType | undefined,
    terraformWorkspaces: TerraformWorkspace[] | undefined,
    deleteWorkspace: boolean
  ) {
    if (
      deployment === undefined ||
      terraformWorkspaces === undefined ||
      !deleteWorkspace
    ) {
      return;
    }

    toast.promise(
      deleteDeploymentAsync([
        deployment.deploymentWorkspace,
        deployment.deploymentSubscriptionId,
      ]),
      {
        pending: "Deleting workspace...",
        success: {
          render(data: any) {
            return `Workspace deleted.`;
          },
          autoClose: 2000,
        },
        error: {
          render(data: any) {
            return `Failed to delete workspace. ${data.data.data}`;
          },
          autoClose: 10000,
        },
      }
    );
  }

  function submitOperation(
    operationType: "plan" | "apply" | "destroy",
    lab: Lab
  ) {
    if (operationType === "apply") {
      return toast.promise(applyAsync(lab), {
        pending: "Starting apply...",
        success: "Apply started.",
        error: "Apply failed.",
      });
    }

    if (operationType === "destroy") {
      return toast.promise(destroyAsync(lab), {
        pending: "Starting destroy...",
        success: "Destroy started.",
        error: "Destroy failed.",
      });
    }

    return toast.promise(planAsync(lab), {
      pending: "Starting plan...",
      success: "Plan started.",
      error: "Plan failed.",
    });
  }

  const onClickHandler = (
    operationType: "plan" | "apply" | "destroy",
    lab: Lab | undefined,
    inProgressStatus: DeploymentStatus,
    failedStatus: DeploymentStatus,
    completedStatus: DeploymentStatus,
    extendLifespan: boolean = false,
    deleteWorkspace: boolean = false
  ) => {
    if (
      lab === undefined ||
      lab.template === undefined ||
      deployments === undefined ||
      terraformWorkspaces === undefined
    ) {
      toast.error(
        "Something went wrong. Please refresh the page and try again."
      );
      return;
    }

    if (actionStatus.inProgress) {
      toast.error("An operation is already in progress.");
      return;
    }

    if (preference !== undefined) {
      lab.template.resourceGroup.location = preference.azureRegion;
    }

    setLogs({ logs: "" });

    //const deployment = getSelectedDeployment(deployments, terraformWorkspaces);
    if (deployment === undefined) {
      toast.error(
        "No deployment selected. Try 'Reset Server Cache' from settings."
      );
      return;
    }

    updateDeploymentStatus(deployment, inProgressStatus, extendLifespan);

    const response = submitOperation(operationType, lab);

    response
      .then((result) => {
        checkDeploymentStatus(
          operationType,
          result.data,
          deployment,
          completedStatus,
          failedStatus,
          extendLifespan,
          deleteWorkspace
        );
      })
      .catch(() => {
        updateDeploymentStatus(deployment, failedStatus, extendLifespan);
      });
  };

  return { onClickHandler };
}
