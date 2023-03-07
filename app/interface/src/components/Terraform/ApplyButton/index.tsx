import React from "react";
import { FaPlane, FaRocket } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useEndStream, useSetLogs } from "../../../hooks/useLogs";
import { usePreference } from "../../../hooks/usePreference";
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
  const { mutateAsync: extendAsync } = useExtend();
  const { data: inProgress } = useActionStatus();
  const { data: preference } = usePreference();

  const { mutate: endLogStream } = useEndStream();

  function onClickHandler() {
    if (lab !== undefined) {
      // Apply Preference
      if (lab.template !== undefined && preference !== undefined) {
        lab.template.resourceGroup.location = preference.azureRegion;
      }

      setLogs({ isStreaming: true, logs: "" });
      applyAsync(lab).then((response) => {
        if (response.status !== undefined) {
          extendAsync(lab).then((response) => {
            endLogStream();
          });
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
        <FaRocket />
      </span>
      {children}
    </Button>
  );
}
