import React, { useContext } from "react";
import { FaCheck } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useSetLogs } from "../../../hooks/useLogs";
import { useExtend } from "../../../hooks/useTerraform";
import Button from "../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../WebSocketContext";
import { toast } from "react-toastify";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ValidateLabButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutateAsync: validateAsync } = useExtend();

  function onClickHandler() {
    setLogs({ logs: "" });
    lab &&
      toast.promise(validateAsync([lab, "validate"]), {
        pending: "Validating Lab...",
        success: "Lab Validated.",
        error: {
          render(data: any) {
            return `Failed to validate lab. ${data.data.data}`;
          },
        },
      });
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={actionStatus.inProgress || lab === undefined}
    >
      <span>
        <FaCheck />
      </span>
      {children}
    </Button>
  );
}
