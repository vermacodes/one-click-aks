import React from "react";
import { useNavigate } from "react-router-dom";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function LoadToBuilderButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutate: setLab } = useSetLab();
  const { data: inProgress } = useActionStatus();
  const navigate = useNavigate();

  function onClickHandler() {
    if (!inProgress && lab !== undefined) {
      setLogs({
        isStreaming: false,
        logs: JSON.stringify(lab.template, null, 4),
      });
      setLab(lab);
      navigate("/builder");
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
