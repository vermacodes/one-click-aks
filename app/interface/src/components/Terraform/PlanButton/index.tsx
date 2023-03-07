import React from "react";
import { FaFile, FaPlane } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useEndStream, useSetLogs } from "../../../hooks/useLogs";
import { usePreference } from "../../../hooks/usePreference";
import { usePlan } from "../../../hooks/useTerraform";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function PlanButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutate: endLogStream } = useEndStream();
  const { mutateAsync: planAsync } = usePlan();
  const { data: inProgress } = useActionStatus();
  const { data: preference } = usePreference();

  function onClickHandler() {
    // Apply Preference
    if (
      lab !== undefined &&
      lab.template !== undefined &&
      preference !== undefined
    ) {
      lab.template.resourceGroup.location = preference.azureRegion;
    }
    setLogs({ isStreaming: true, logs: "" });
    lab &&
      planAsync(lab).then(() => {
        endLogStream();
      });
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaFile />
      </span>
      {children}
    </Button>
  );
}
