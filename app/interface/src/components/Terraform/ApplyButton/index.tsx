import React from "react";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useSetLogs } from "../../../hooks/useLogs";
import { useApply, useExtend } from "../../../hooks/useTerraform";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ApplyButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: applyAsync } = useApply();
  const { mutate: extend } = useExtend();
  const { data: inProgress } = useActionStatus();

  function onClickHandler() {
    if (lab !== undefined) {
      setLogs({ isStreaming: true, logs: "" });
      applyAsync(lab).then((response) => {
        console.log("response status -> ", response.status);
        if (response.status !== undefined) {
          extend(lab);
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
      {children}
    </Button>
  );
}
