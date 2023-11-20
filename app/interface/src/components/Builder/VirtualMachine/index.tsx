import { useContext } from "react";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import { defaultTfvarConfig } from "../../../defaults";
import { WebSocketContext } from "../../Context/WebSocketContext";

export default function VirtualMachine() {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { data: lab, isLoading, isFetching } = useLab();
  const { mutate: setLab } = useSetLab();

  // Function to handle changes in the checkbox
  const handleOnChange = () => {
    if (lab?.template) {
      // Toggle the jump servers
      lab.template.jumpservers =
        lab.template.jumpservers.length === 0
          ? defaultTfvarConfig.jumpservers
          : [];

      // Log the changes if not in progress
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab.template, null, 4) });

      // Update the lab
      setLab(lab);
    }
  };

  // Define the disabled state
  const disabled =
    lab?.template?.kubernetesClusters.length === 0 || isLoading || isFetching;

  // Define the checked state
  const checked = (lab?.template?.jumpservers?.length ?? 0) > 0;

  return lab?.template ? (
    <Checkbox
      id="toggle-jumpserver"
      label="Jump Server"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  ) : null;
}
