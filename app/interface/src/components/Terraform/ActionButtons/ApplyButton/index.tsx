import React from "react";
import { v4 as uuid } from "uuid";
import { FaRocket } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import { useWebSocketContext } from "../../../Context/WebSocketContext";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";
import { useSelectedDeployment } from "../../../../hooks/useSelectedDeployment";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ApplyButton({ variant, children, lab }: Props) {
  const { actionStatus } = useWebSocketContext();
  const { onClickHandler } = useTerraformOperation();
  const { selectedDeployment } = useSelectedDeployment();

  return (
    <>
      <Button
        variant={variant}
        onClick={() =>
          onClickHandler({
            operationType: "apply",
            lab: lab,
            deployment: selectedDeployment,
            operationId: uuid(),
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
