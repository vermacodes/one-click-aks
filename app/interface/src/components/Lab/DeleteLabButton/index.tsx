import React, { useContext } from "react";
import { FaTrash } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useDeleteLab, useDeleteMyLab } from "../../../hooks/useBlobs";
import { useSetLogs } from "../../../hooks/useLogs";
import Button from "../../Button";
import { WebSocketContext } from "../../../WebSocketContext";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DeleteLabButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { data: inProgress } = useContext(WebSocketContext);
  const { mutate: deleteLab } = useDeleteLab();
  const { mutate: deleteMyLab } = useDeleteMyLab();

  function onClickHandler() {
    //setLogs({ isStreaming: true, logs: "" });
    if (lab !== undefined) {
      if (lab.type === "template") {
        deleteMyLab(lab);
      } else {
        deleteLab(lab);
      }
    }
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={inProgress || lab === undefined}
    >
      <span>
        <FaTrash />
      </span>
      {children}
    </Button>
  );
}
