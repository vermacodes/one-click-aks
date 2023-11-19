import React, { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { FaRocket } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import { useWebSocketContext } from "../../../../WebSocketContext";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";
import { toast } from "react-toastify";
import { useSelectedDeployment } from "../../../../hooks/useSelectedDeployment";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ApplyButton({ variant, children, lab }: Props) {
  const { actionStatus, terraformOperation } = useWebSocketContext();
  const { onClickHandler, updateDeploymentStatus } = useTerraformOperation();
  const { selectedDeployment } = useSelectedDeployment();
  const [operationId, setOperationId] = React.useState<string>(uuid());

  useEffect(() => {
    if (terraformOperation.operationId === operationId) {
      updateDeploymentStatus({
        deployment: selectedDeployment,
        status: terraformOperation.status,
        extendLifespan: true,
      });
      if (terraformOperation.status === "Deployment Failed") {
        toast.error(terraformOperation.status);
        setOperationId(uuid());
      }
      if (terraformOperation.status === "Deployment Completed") {
        toast.success(terraformOperation.status);
        setOperationId(uuid());
      }
      if (terraformOperation.status === "Deployment In Progress") {
        toast.info(terraformOperation.status);
      }
    }

    return () => {
      console.log("Apply Button Unmounted");
    };
  }, [terraformOperation]);

  return (
    <>
      <Button
        variant={variant}
        onClick={() =>
          onClickHandler({
            operationType: "apply",
            lab: lab,
            operationId: operationId,
          })
        }
        disabled={actionStatus.inProgress || lab === undefined}
      >
        <span className="text-base">
          <FaRocket />
        </span>
        {children}
      </Button>
    </>
  );
}
