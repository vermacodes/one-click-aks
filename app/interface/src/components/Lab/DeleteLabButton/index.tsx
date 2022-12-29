import React from "react";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useDeleteLab } from "../../../hooks/useBlobs";
import { useSetLogs } from "../../../hooks/useLogs";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DeleteLabButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { data: inProgress } = useActionStatus();
  const { mutate: deleteLab } = useDeleteLab();

  function onClickHandler() {
    setLogs({ isStreaming: true, logs: "" });
    lab && deleteLab(lab);
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={inProgress || lab === undefined}
    >
      {children}
    </Button>
  );
}
