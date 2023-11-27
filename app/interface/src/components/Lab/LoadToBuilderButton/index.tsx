import React, { useContext } from "react";
import { FaTools } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useSetLogs } from "../../../hooks/useLogs";
import { usePreference } from "../../../hooks/usePreference";
import { useGlobalStateContext } from "../../Context/GlobalStateContext";
import { WebSocketContext } from "../../Context/WebSocketContext";
import Button from "../../UserInterfaceComponents/Button";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function LoadToBuilderButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { setLab } = useGlobalStateContext();
  const { actionStatus } = useContext(WebSocketContext);
  const { data: preference } = usePreference();
  const navigate = useNavigate();

  function onClickHandler() {
    if (lab !== undefined) {
      // Apply Preference
      if (lab.template !== undefined && preference !== undefined) {
        lab.template.resourceGroup.location = preference.azureRegion;
      }

      // Update logs only if no action is in progress.
      if (!actionStatus.inProgress) {
        setLogs({
          logs: JSON.stringify(lab.template, null, 4),
        });
      }

      // Set lab and navigate to builder.
      setLab(lab);
      navigate("/builder");
    }
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={lab === undefined}
    >
      <span>
        <FaTools />
      </span>
      {children}
    </Button>
  );
}
