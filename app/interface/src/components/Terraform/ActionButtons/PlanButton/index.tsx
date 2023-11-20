import React from "react";
import { FaFile } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import { useWebSocketContext } from "../../../Context/WebSocketContext";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";
import { v4 as uuid } from "uuid";
import { useSelectedDeployment } from "../../../../hooks/useSelectedDeployment";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function PlanButton({ variant, children, lab }: Props) {
  const { actionStatus } = useWebSocketContext();
  const { onClickHandler } = useTerraformOperation();
  const { selectedDeployment: deployment } = useSelectedDeployment();

  return (
    <Button
      variant={variant}
      onClick={() =>
        onClickHandler({
          lab: lab,
          deployment: deployment,
          operationId: uuid(),
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
