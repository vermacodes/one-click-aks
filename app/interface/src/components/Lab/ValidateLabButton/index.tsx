import React, { useContext } from "react";
import { FaCheck } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useSetLogs } from "../../../hooks/useLogs";
import { useValidate } from "../../../hooks/useTerraform";
import Button from "../../Button";
import { WebSocketContext } from "../../../WebSocketContext";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ValidateLabButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutateAsync: validateAsync } = useValidate();

  function onClickHandler() {
    setLogs({ logs: "" });
    lab && validateAsync(lab);
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
