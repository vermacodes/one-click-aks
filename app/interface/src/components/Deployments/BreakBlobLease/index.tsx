import { FaCut, FaUnlock } from "react-icons/fa";
import { ButtonVariant, DeploymentType } from "../../../dataStructures";
import { useGetMyDeployments } from "../../../hooks/useDeployments";
import { useBreakBlobLease } from "../../../hooks/useStorageAccount";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import { getSelectedDeployment } from "../../../utils/helpers";
import Button from "../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../WebSocketContext";
import { useContext } from "react";
import Tooltip from "../../UserInterfaceComponents/Tooltip";
import { toast } from "react-toastify";

type Props = {
  deployment: DeploymentType;
  buttonVariant?: ButtonVariant;
};

export default function BreakBlobLease({ deployment, buttonVariant }: Props) {
  const { mutateAsync: breakBlobLease } = useBreakBlobLease();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { actionStatus } = useContext(WebSocketContext);

  function handleBreakBlobLease() {
    toast.promise(
      breakBlobLease(deployment.deploymentWorkspace),
      {
        pending: "Unlocking state file...",
        success: "State file unlocked",
        error: "Error unlocking state file",
      },
      {
        toastId: "break-blob-lease",
      }
    );
  }

  if (deployments === undefined || terraformWorkspaces === undefined) {
    return null;
  }

  const selectedDeployment = getSelectedDeployment(
    deployments,
    terraformWorkspaces
  );

  const disabled =
    actionStatus.inProgress ||
    selectedDeployment === undefined ||
    deployment.deploymentWorkspace !== selectedDeployment.deploymentWorkspace;

  return (
    <Tooltip message="Use this to unlock the state file if locked" delay={500}>
      <Button
        variant={buttonVariant ? buttonVariant : "secondary-outline"}
        disabled={disabled}
        onClick={handleBreakBlobLease}
      >
        <FaUnlock /> State
      </Button>
    </Tooltip>
  );
}
