import { FaCut } from "react-icons/fa";
import { DeploymentType } from "../../../dataStructures";
import { useGetMyDeployments } from "../../../hooks/useDeployments";
import { useBreakBlobLease } from "../../../hooks/useStorageAccount";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import { getSelectedDeployment } from "../../../utils/helpers";
import Button from "../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../WebSocketContext";
import { useContext } from "react";
import Tooltip from "../../UserInterfaceComponents/Tooltip";

type Props = {
  deployment: DeploymentType;
};

export default function BreakBlobLease({ deployment }: Props) {
  const { mutate: breakBlobLease } = useBreakBlobLease();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { actionStatus } = useContext(WebSocketContext);

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
    <Tooltip
      message="Use this to break the lease of terraform state file"
      delay={500}
    >
      <Button
        variant="secondary-outline"
        disabled={disabled}
        onClick={() => breakBlobLease(deployment.deploymentWorkspace)}
      >
        <FaCut /> Lease
      </Button>
    </Tooltip>
  );
}
