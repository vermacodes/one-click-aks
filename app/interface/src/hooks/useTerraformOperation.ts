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
import { useApply, useDestroy, useInit, usePlan } from "./useTerraform";
import { usePreference } from "./usePreference";
import { useTerraformWorkspace } from "./useWorkspace";
import { toast } from "react-toastify";
import { calculateNewEpochTimeForDeployment } from "../utils/helpers";
import { useSelectedDeployment } from "./useSelectedDeployment";
import { AxiosResponse } from "axios";

export function useTerraformOperation() {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: initAsync } = useInit();
  const { mutateAsync: planAsync } = usePlan();
  const { mutateAsync: applyAsync } = useApply();
  const { mutateAsync: destroyAsync } = useDestroy();
  const { data: preference } = usePreference();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { mutate: patchDeployment } = usePatchDeployment();
  const { mutateAsync: deleteDeploymentAsync } = useDeleteDeployment();
  const { selectedDeployment: deployment } = useSelectedDeployment();

  type UpdateDeploymentStatusProps = {
    deployment: DeploymentType | undefined;
    status: DeploymentStatus;
    extendLifespan?: boolean;
  };

  function updateDeploymentStatus({
    deployment,
    status,
    extendLifespan = false,
  }: UpdateDeploymentStatusProps) {
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

  type DeleteDeploymentProps = {
    deployment: DeploymentType | undefined;
  };

  function deleteDeployment({ deployment }: DeleteDeploymentProps) {
    if (deployment === undefined) {
      toast.error("No deployment selected.");
      return;
    }

    toast.promise(
      deleteDeploymentAsync([
        deployment.deploymentWorkspace,
        deployment.deploymentSubscriptionId,
      ]),
      {
        pending: "Deleting deployment...",
        success: {
          render: `Deployment deleted.`,
          autoClose: 2000,
        },
        error: {
          render: `Failed to delete deployment.`,
          autoClose: 10000,
        },
      }
    );
  }

  type SubmitOperationProps = {
    operationType: "init" | "plan" | "apply" | "destroy";
    operationId: string;
    lab: Lab;
  };

  function submitOperation({
    operationType,
    operationId,
    lab,
  }: SubmitOperationProps): Promise<AxiosResponse<TerraformOperation>> {
    if (operationType === "plan") {
      return planAsync([lab, operationId]);
    }
    if (operationType === "apply") {
      return applyAsync([lab, operationId]);
    }
    if (operationType === "destroy") {
      return destroyAsync([lab, operationId]);
    }

    return initAsync([lab, operationId]);
  }

  type OnClickHandlerProps = {
    operationType: "init" | "plan" | "apply" | "destroy";
    operationId: string;
    lab: Lab | undefined;
  };

  const onClickHandler = ({
    operationType,
    operationId,
    lab,
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

    submitOperation({ operationType, operationId, lab });
  };

  return { onClickHandler, deleteDeployment, updateDeploymentStatus };
}
