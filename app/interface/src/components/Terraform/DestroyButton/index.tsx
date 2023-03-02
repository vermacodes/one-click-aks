import React from "react";
import { FaTrash } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useSetLogs } from "../../../hooks/useLogs";
import { useDestroy, useDestroyExtend } from "../../../hooks/useTerraform";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DestroyButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutate: destroy } = useDestroy();
  const { mutateAsync: destroyExtendAsync } = useDestroyExtend();
  const { data: inProgress } = useActionStatus();

  function onClickHandler() {
    setLogs({ isStreaming: true, logs: "" });
    if (lab !== undefined) {
      destroyExtendAsync(lab).then((response) => {
        if (response.status !== undefined) {
          destroy(lab);
        }
      });
    }
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaTrash />
      </span>
      {children}
    </Button>
  );
}
