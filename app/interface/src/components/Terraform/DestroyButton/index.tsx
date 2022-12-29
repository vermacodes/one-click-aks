import React from "react";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useSetLogs } from "../../../hooks/useLogs";
import { useDestroy } from "../../../hooks/useTerraform";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DestroyButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutate: destroy } = useDestroy();
  const { data: inProgress } = useActionStatus();

  function onClickHandler() {
    setLogs({ isStreaming: true, logs: "" });
    lab && destroy(lab);
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
