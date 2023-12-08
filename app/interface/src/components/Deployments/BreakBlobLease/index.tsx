import { useContext } from "react";
import { FaUnlock } from "react-icons/fa";
import { toast } from "react-toastify";
import { ButtonVariant, DeploymentType } from "../../../dataStructures";
import { useGetMyDeployments } from "../../../hooks/useDeployments";
import { useSelectedDeployment } from "../../../hooks/useSelectedDeployment";
import { useBreakBlobLease } from "../../../hooks/useStorageAccount";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import { WebSocketContext } from "../../Context/WebSocketContext";
import Button from "../../UserInterfaceComponents/Button";
import Tooltip from "../../UserInterfaceComponents/Tooltip";

type Props = {
  deployment: DeploymentType;
  buttonVariant?: ButtonVariant;
};

export default function BreakBlobLease({ deployment, buttonVariant }: Props) {
  const { mutateAsync: breakBlobLease } = useBreakBlobLease();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { actionStatus } = useContext(WebSocketContext);
  const { selectedDeployment } = useSelectedDeployment();

  async function handleBreakBlobLease() {
    // Generate a unique ID for the toast
    const toastId = `break-blob-lease-${Date.now()}`;

    toast.promise(
      breakBlobLease(deployment.deploymentWorkspace),
      {
        pending: "Unlocking state file...",
        success: {
          render(data: any) {
            return `State file unlocked.`;
          },
          autoClose: 2000,
        },
        error: {
          render(data: any) {
            return `Failed to unlock state file. ${data.data.response.data.error}`;
          },
          autoClose: 5000,
        },
      },
      {
        toastId: toastId,
      }
    );
  }

  if (deployments === undefined || terraformWorkspaces === undefined) {
    return null;
  }

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
