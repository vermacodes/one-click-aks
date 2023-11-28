import { useContext, useState } from "react";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../Context/WebSocketContext";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";

type Props = {
  index: number;
};

export default function UserDefinedRouting({ index }: Props) {
  const [tooltipMessage, setTooltipMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { lab, setLab } = useGlobalStateContext();

  const handleOnChange = () => {
    const newLab = structuredClone(lab);
    const cluster = newLab?.template?.kubernetesClusters[index];
    if (cluster?.outboundType !== undefined && newLab !== undefined) {
      cluster.outboundType =
        cluster.outboundType === "userDefinedRouting"
          ? "loadBalancer"
          : "userDefinedRouting";
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(newLab?.template, null, 4) });
      setLab(newLab);
    }
  };

  const checked =
    lab?.template?.kubernetesClusters[index]?.outboundType ===
    "userDefinedRouting";
  const disabled =
    !lab?.template?.kubernetesClusters[index] ||
    lab?.template?.virtualNetworks.length === 0 ||
    lab?.template?.firewalls.length === 0;

  const noVirtualNetworksMessage = "Virtual Network Required.";
  const noFirewallsMessage = "Firewall Required.";

  let newTooltipMessage = "";

  if (lab?.template?.virtualNetworks.length === 0) {
    newTooltipMessage += noVirtualNetworksMessage + " ";
  }

  if (lab?.template?.firewalls.length === 0) {
    newTooltipMessage += noFirewallsMessage;
  }

  if (
    lab &&
    lab.template &&
    lab?.template?.virtualNetworks.length > 0 &&
    lab?.template?.firewalls.length > 0
  ) {
    newTooltipMessage = "";
  }

  if (newTooltipMessage !== tooltipMessage) {
    setTooltipMessage(newTooltipMessage);
  }

  return lab?.template ? (
    <Checkbox
      id="toggle-udr"
      label="UDR"
      checked={checked}
      disabled={disabled}
      tooltipMessage={tooltipMessage}
      tooltipDelay={200}
      handleOnChange={handleOnChange}
    />
  ) : null;
}
