import React from "react";
import { FaCheck } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useEndStream, useSetLogs } from "../../../hooks/useLogs";
import { useValidate } from "../../../hooks/useTerraform";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ValidateLabButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutate: endLogStream } = useEndStream();
  const { data: inProgress } = useActionStatus();
  const { mutateAsync: validateAsync } = useValidate();

  function onClickHandler() {
    setLogs({ isStreaming: true, logs: "" });
    lab &&
      validateAsync(lab).then(() => {
        endLogStream();
      });
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={inProgress || lab === undefined}
    >
      <span>
        <FaCheck />
      </span>
      {children}
    </Button>
  );
}
