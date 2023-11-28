import { useContext, useState } from "react";
import { getDefaultFirewall } from "../../../defaults";
import { useSetLogs } from "../../../hooks/useLogs";
import { useGlobalStateContext } from "../../Context/GlobalStateContext";
import { WebSocketContext } from "../../Context/WebSocketContext";
import Checkbox from "../../UserInterfaceComponents/Checkbox";

export default function AzureFirewall() {
  const [tooltipMessage, setTooltipMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { lab, setLab } = useGlobalStateContext();

  const noVirtualNetworksMessage = "Virtual Network Required.";

  function handleOnChange() {
    const newLab = structuredClone(lab);
    if (newLab !== undefined) {
      if (newLab.template !== undefined) {
        if (newLab.template.firewalls.length > 0) {
          newLab.template.firewalls = [];
        } else {
          newLab.template.firewalls = [getDefaultFirewall()];
        }
        !actionStatus.inProgress &&
          setLogs({
            logs: JSON.stringify(newLab.template, null, 4),
          });
        setLab(newLab);
      }
    }
  }

  if (lab === undefined || lab.template === undefined) {
    return <></>;
  }

  var checked: boolean = true;
  if (lab && lab.template && lab.template.firewalls.length === 0) {
    checked = false;
  }

  var disabled: boolean = false;
  if (lab && lab.template && lab.template.virtualNetworks.length === 0) {
    disabled = true;
  }

  if (
    lab?.template?.virtualNetworks.length === 0 &&
    tooltipMessage !== noVirtualNetworksMessage
  ) {
    setTooltipMessage(noVirtualNetworksMessage);
  }

  if (lab?.template?.virtualNetworks.length > 0 && tooltipMessage) {
    setTooltipMessage("");
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-azure-firewall"
          label="Firewall"
          checked={checked}
          disabled={disabled}
          tooltipMessage={tooltipMessage}
          tooltipDelay={200}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
