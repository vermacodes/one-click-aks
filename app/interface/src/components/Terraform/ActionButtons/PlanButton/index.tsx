import React, { useContext } from "react";
import { FaFile } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import { useSetLogs } from "../../../../hooks/useLogs";
import { usePreference } from "../../../../hooks/usePreference";
import { usePlan } from "../../../../hooks/useTerraform";
import Button from "../../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../../WebSocketContext";
import { toast } from "react-toastify";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function PlanButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: planAsync } = usePlan();
  const { actionStatus, setActionStatus } = useContext(WebSocketContext);
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
    setLogs({ logs: "" });
    lab &&
      toast.promise(planAsync(lab), {
        pending: "Planning...",
        success: "Plan completed.",
        error: {
          render(data: any) {
            return `Plan failed: ${data.data.data}`;
          },
        },
      });
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      tooltipMessage="Preview the changes before deploy."
      tooltipDelay={1000}
      disabled={actionStatus.inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaFile />
      </span>
      {children}
    </Button>
  );
}
