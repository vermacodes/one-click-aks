import React from "react";
import { FaFile, FaPlane } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useSetLogs } from "../../../hooks/useLogs";
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
  const { mutate: plan } = usePlan();
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
    lab && plan(lab);
  }

  return (
    <button
      className={`flex items-center gap-3 rounded py-1 px-3 text-lg hover:bg-sky-500 hover:bg-opacity-20`}
      onClick={onClickHandler}
      disabled={inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaFile />
      </span>
      {children}
    </button>
  );
}
