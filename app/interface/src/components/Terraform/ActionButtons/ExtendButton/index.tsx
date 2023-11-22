import React, { useContext } from "react";
import { v4 as uuid } from "uuid";
import { FaCheck } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../Context/WebSocketContext";
import { useSelectedDeployment } from "../../../../hooks/useSelectedDeployment";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
  mode: "extend-apply" | "extend-validate" | "extend-destroy";
};

export default function ExtendButton({ variant, children, lab, mode }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { selectedDeployment } = useSelectedDeployment();
  const { onClickHandler } = useTerraformOperation();

  return (
    <Button
      variant={variant}
      onClick={() =>
        onClickHandler({
          operationType: mode,
          lab: lab,
          deployment: selectedDeployment,
          operationId: uuid(),
        })
      }
      disabled={actionStatus.inProgress || lab === undefined}
    >
      {children}
    </Button>
  );
}
