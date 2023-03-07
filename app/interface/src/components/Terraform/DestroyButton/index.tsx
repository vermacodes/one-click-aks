import React from "react";
import { FaTrash } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useEndStream, useSetLogs } from "../../../hooks/useLogs";
import { useDestroy, useDestroyExtend } from "../../../hooks/useTerraform";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  navbarButton?: boolean;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DestroyButton({
  variant,
  navbarButton,
  children,
  lab,
}: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: destroyAsync } = useDestroy();
  const { mutateAsync: destroyExtendAsync } = useDestroyExtend();
  const { data: inProgress } = useActionStatus();
  const { mutate: endLogStream } = useEndStream();

  function onClickHandler() {
    setLogs({ isStreaming: true, logs: "" });
    if (lab !== undefined) {
      destroyExtendAsync(lab).then((response) => {
        if (response.status !== undefined) {
          destroyAsync(lab).then((response) => {
            endLogStream();
          });
        }
      });
    }
  }

  // This is used by Navbar
  if (navbarButton) {
    return (
      <button
        className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base disabled:cursor-not-allowed disabled:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
        onClick={onClickHandler}
        disabled={inProgress || lab === undefined}
      >
        {children}
      </button>
    );
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
