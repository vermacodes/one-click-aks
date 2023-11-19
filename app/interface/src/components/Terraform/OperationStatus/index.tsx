import { useEffect } from "react";
import { useWebSocketContext } from "../../../WebSocketContext";
import { toast } from "react-toastify";
import {
  useDeleteDeployment,
  usePatchDeployment,
} from "../../../hooks/useDeployments";
import { useSelectedDeployment } from "../../../hooks/useSelectedDeployment";
import { calculateNewEpochTimeForDeployment } from "../../../utils/helpers";

type Props = {
  operationId: "plan" | "apply" | "destroy";
  extendLifespan?: boolean;
  deleteWorkspace?: boolean;
};

export default function OperationStatus({
  operationId,
  extendLifespan = false,
  deleteWorkspace = false,
}: Props) {
  const { terraformOperation } = useWebSocketContext();
  const { mutateAsync: patchDeployment } = usePatchDeployment();
  const { selectedDeployment: deployment } = useSelectedDeployment();
  const { mutateAsync: deleteDeploymentAsync } = useDeleteDeployment();

  function updateDeploymentStatus(operationId: "plan" | "apply" | "destroy") {
    console.log("operationId: ", operationId);
    if (operationId === "plan") {
      // When planning a deployment, we don't want to update the deployment status.
      return;
    }

    if (deployment !== undefined) {
      if (extendLifespan) {
        patchDeployment({
          ...deployment,
          deploymentAutoDeleteUnixTime:
            calculateNewEpochTimeForDeployment(deployment),
          deploymentStatus: terraformOperation.status,
        });
      } else {
        patchDeployment({
          ...deployment,
          deploymentStatus: terraformOperation.status,
        });
      }
    }
  }

  function handleDeleteWorkspace() {
    if (deployment === undefined || !deleteWorkspace) {
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

  useEffect(() => {
    if (terraformOperation.operationId === operationId) {
      if (terraformOperation.status.includes("Failed")) {
        toast.error(terraformOperation.status);
      } else {
        toast.success(terraformOperation.status);
      }
    }

    updateDeploymentStatus(terraformOperation.operationId);
    handleDeleteWorkspace();
  }, [terraformOperation]);

  return null;
}
