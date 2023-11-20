import React, { useEffect } from "react";
import { FaFile } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import { useWebSocketContext } from "../../../Context/WebSocketContext";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import { useSelectedDeployment } from "../../../../hooks/useSelectedDeployment";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function PlanButton({ variant, children, lab }: Props) {
  const { actionStatus, terraformOperation } = useWebSocketContext();
  const { onClickHandler } = useTerraformOperation();
  const { selectedDeployment: deployment } = useSelectedDeployment();

  const [operationId, setOperationId] = React.useState<string>(uuid());

  useEffect(() => {
    // get the operationId from localStorage
    let operationIdFromLocalStorage = localStorage.getItem(
      deployment?.deploymentWorkspace + "plan-operation-id"
    );
    if (operationIdFromLocalStorage !== null) {
      setOperationId(operationIdFromLocalStorage);
    }
  }, []);

  useEffect(() => {
    if (terraformOperation.operationId === operationId) {
      if (terraformOperation.status === "Plan Failed") {
        toast.error(terraformOperation.status);
        setOperationId(uuid());
      }
      if (terraformOperation.status === "Plan Completed") {
        toast.success(terraformOperation.status);
        setOperationId(uuid());

        // remove the operationId from localStorage
        if (deployment !== undefined) {
          localStorage.removeItem(
            deployment.deploymentWorkspace + "plan-operation-id"
          );
        }
      }
      if (terraformOperation.status === "Plan In Progress") {
        toast.info(terraformOperation.status);

        // store the operationId in localStorage
        if (deployment !== undefined) {
          localStorage.setItem(
            deployment.deploymentWorkspace + "plan-operation-id",
            operationId
          );
        }
      }
    }
  }, [terraformOperation]);

  return (
    <Button
      variant={variant}
      onClick={() =>
        onClickHandler({
          lab: lab,
          deployment: deployment,
          operationId: operationId,
          operationType: "plan",
        })
      }
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
