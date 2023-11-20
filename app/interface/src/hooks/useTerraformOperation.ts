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
import {
  useApply,
  useDestroy,
  useDestroyAndDelete,
  useInit,
  usePlan,
} from "./useTerraform";
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
  const { mutateAsync: destroyAndDeleteAsync } = useDestroyAndDelete();
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
    operationId: string;
    deployment: DeploymentType | undefined;
  };

  async function deleteDeployment({
    operationId,
    deployment,
  }: DeleteDeploymentProps) {
    if (deployment === undefined) {
      toast.error("No deployment selected.");
      return Promise.reject();
    }

    return toast.promise(
      deleteDeploymentAsync([
        deployment.deploymentWorkspace,
        deployment.deploymentSubscriptionId,
        operationId,
      ]),
      {
        pending: "Deleting deployment...",
        success: {
          render: `Delete In Progress`,
          autoClose: 5000,
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
    deployment: DeploymentType | undefined;
    deleteDeployment?: boolean | undefined;
  };

  function submitOperation({
    operationType,
    operationId,
    lab,
    deployment,
    deleteDeployment: deleteDeploymentFlag = false,
  }: SubmitOperationProps): Promise<AxiosResponse<TerraformOperation>> {
    if (operationType === "plan") {
      return planAsync([lab, operationId]);
    }
    if (operationType === "apply") {
      return applyAsync([lab, operationId]);
    }
    if (operationType === "destroy" && deleteDeploymentFlag) {
      if (deployment === undefined) {
        toast.error("No deployment selected.");
        return Promise.reject();
      }
      return deleteDeployment({ operationId, deployment });
    }
    if (operationType === "destroy" && !deleteDeploymentFlag) {
      return destroyAsync([lab, operationId]);
    }

    return initAsync([lab, operationId]);
  }

  type OnClickHandlerProps = {
    operationType: "init" | "plan" | "apply" | "destroy";
    operationId: string;
    lab: Lab | undefined;
    deployment?: DeploymentType | undefined;
    deleteDeployment?: boolean | undefined;
  };

  const onClickHandler = ({
    operationType,
    operationId,
    lab,
    deployment,
    deleteDeployment = false,
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

    submitOperation({
      operationType,
      operationId,
      lab,
      deployment,
      deleteDeployment,
    });
  };

  return { onClickHandler, deleteDeployment, updateDeploymentStatus };
}
