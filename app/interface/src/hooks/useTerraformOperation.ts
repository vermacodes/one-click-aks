import { useContext, useEffect, useRef, useState } from "react";
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
import { useWebSocketContext } from "../WebSocketContext";
import { usePreference } from "./usePreference";
import { useTerraformWorkspace } from "./useWorkspace";
import { toast } from "react-toastify";
import { calculateNewEpochTimeForDeployment } from "../utils/helpers";
import { axiosInstance } from "../utils/axios-interceptors";
import { useSelectedDeployment } from "./useSelectedDeployment";
import { AxiosResponse } from "axios";

export function useTerraformOperation() {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: planAsync } = usePlan();
  const { mutateAsync: applyAsync } = useApply();
  const { mutateAsync: destroyAsync } = useDestroy();
  const { actionStatus } = useWebSocketContext();
  const { data: preference } = usePreference();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { mutate: patchDeployment } = usePatchDeployment();
  const { mutateAsync: deleteDeploymentAsync } = useDeleteDeployment();
  const { selectedDeployment: deployment } = useSelectedDeployment();

  // const [actionStatusState, setActionStatusState] = useState(
  //   actionStatus.inProgress
  // );

  // //const actionStatusRef = useRef(actionStatus);
  // const actionStatusStateRef = useRef(actionStatusState);

  // useEffect(() => {
  //   console.log("actionStatus: ", actionStatus);
  //   //actionStatusStateRef.current = actionStatus.inProgress;
  //   if (actionStatus.inProgress !== actionStatusState) {
  //     setActionStatusState(actionStatus.inProgress);
  //   }
  // }, [actionStatus]);

  type UpdateDeploymentStatusProps = {
    operationType: "plan" | "apply" | "destroy";
    deployment: DeploymentType | undefined;
    status: DeploymentStatus;
    extendLifespan: boolean;
  };

  function updateDeploymentStatus({
    operationType,
    deployment,
    status,
    extendLifespan,
  }: UpdateDeploymentStatusProps) {
    if (operationType === "plan") {
      // When planning a deployment, we don't want to update the deployment status.
      return;
    }

    if (deployment !== undefined) {
      if (extendLifespan) {
        patchDeployment({
          ...deployment,
          deploymentAutoDeleteUnixTime:
            calculateNewEpochTimeForDeployment(deployment),
          deploymentStatus: status,
        });
      } else {
        patchDeployment({
          ...deployment,
          deploymentStatus: status,
        });
      }
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

  type CheckDeploymentStatusProps = {
    operationType: "plan" | "apply" | "destroy";
    operation: TerraformOperation;
    deployment: DeploymentType;
    completedStatus: DeploymentStatus;
    failedStatus: DeploymentStatus;
    extendLifespan: boolean;
    deleteWorkspace: boolean;
  };

  function checkDeploymentStatus({
    operationType,
    operation,
    deployment,
    completedStatus,
    failedStatus,
    extendLifespan,
    deleteWorkspace,
  }: CheckDeploymentStatusProps) {
    console.log("checkDeploymentStatus: ", operation);
    const intervalId = setInterval(async () => {
      // console.log("actionStatusRef.current: ", actionStatusRef.current);
      // if (actionStatusRef.current.inProgress) {
      //   return;
      // }
      // console.log("actionStatusState: ", actionStatusState);
      // console.log(
      //   "actionStatusStateRef.current: ",
      //   actionStatusStateRef.current
      // );

      // if (actionStatusStateRef.current) {
      //   return;
      // }
      const terraformOp = await checkStatusAsync(operation.operationId);

      if (terraformOp === undefined || terraformOp.inProgress) {
        return;
      }

      console.log("terraformOp: ", terraformOp);
      if (terraformOp.status === completedStatus) {
        toast.success(completedStatus),
          {
            autoClose: 5000,
          };
        updateDeploymentStatus({
          operationType,
          deployment,
          status: completedStatus,
          extendLifespan,
        });

        if (operationType === "destroy") {
          console.log("Deleting Workspace?, ", deleteWorkspace);
          handleDeleteWorkspace({
            deployment,
            terraformWorkspaces,
            deleteWorkspace,
          });
        }
      } else if (terraformOp.status === failedStatus) {
        toast.error(failedStatus),
          {
            autoClose: 10000,
          };
        updateDeploymentStatus({
          operationType,
          deployment,
          status: failedStatus,
          extendLifespan,
        });
      }
      clearInterval(intervalId);
    }, 500);
  }

  type HandleDeleteWorkspaceProps = {
    deployment: DeploymentType | undefined;
    terraformWorkspaces: TerraformWorkspace[] | undefined;
    deleteWorkspace: boolean;
  };

  function handleDeleteWorkspace({
    deployment,
    terraformWorkspaces,
    deleteWorkspace,
  }: HandleDeleteWorkspaceProps) {
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
          render: `Workspace deleted.`,
          autoClose: 2000,
        },
        error: {
          render: `Failed to delete workspace.`,
          autoClose: 10000,
        },
      }
    );
  }

  type SubmitOperationProps = {
    operationType: "plan" | "apply" | "destroy";
    lab: Lab;
  };

  function submitOperation({
    operationType,
    lab,
  }: SubmitOperationProps): Promise<AxiosResponse<TerraformOperation>> {
    if (operationType === "apply") {
      console.log("submitting apply");
      return toast.promise(applyAsync(lab), {
        pending: "Starting apply...",
        success: "Apply started.",
        error: "Apply failed.",
      });
    }

    if (operationType === "destroy") {
      console.log("submitting destroy");
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

  type OnClickHandlerProps = {
    operationType: "plan" | "apply" | "destroy";
    lab: Lab | undefined;
    inProgressStatus: DeploymentStatus;
    failedStatus: DeploymentStatus;
    completedStatus: DeploymentStatus;
    extendLifespan: boolean;
    deleteWorkspace: boolean;
  };

  const onClickHandler = ({
    operationType,
    lab,
    inProgressStatus,
    failedStatus,
    completedStatus,
    extendLifespan,
    deleteWorkspace,
  }: OnClickHandlerProps) => {
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

    // if (actionStatus.inProgress) {
    //   toast.error("An operation is already in progress.");
    //   return;
    // }

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

    updateDeploymentStatus({
      operationType,
      deployment,
      status: inProgressStatus,
      extendLifespan,
    });

    const response = submitOperation({ operationType, lab });

    response
      .then((result) => {
        console.log("result: ", result);
        checkDeploymentStatus({
          operationType,
          operation: result.data,
          deployment,
          completedStatus,
          failedStatus,
          extendLifespan,
          deleteWorkspace,
        });
      })
      .catch(() => {
        updateDeploymentStatus({
          operationType,
          deployment,
          status: failedStatus,
          extendLifespan,
        });
      });
  };

  return { onClickHandler };
}
