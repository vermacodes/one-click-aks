import { useContext, useState } from "react";
import { useSetLogs } from "../../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../../Context/WebSocketContext";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";

type Props = {
  index: number;
};

export default function AppGateway({ index }: Props) {
  const [tooltipMessage, setTooltipMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { lab, setLab } = useGlobalStateContext();

  const noKubernetesClustersMessage = "Kubernetes Cluster Required.";
  const noVirtualNetworksMessage = "Virtual Network Required.";
  const networkPluginIsOverlayMessage = "Not supported with Overlay";

  let newTooltipMessage = "";

  if (lab?.template?.kubernetesClusters.length === 0) {
    newTooltipMessage += noKubernetesClustersMessage + " ";
  }

  if (lab?.template?.virtualNetworks.length === 0) {
    newTooltipMessage += noVirtualNetworksMessage + " ";
  }

  if (
    lab &&
    lab.template &&
    lab?.template?.kubernetesClusters[index]?.networkPluginMode === "Overlay"
  ) {
    newTooltipMessage += networkPluginIsOverlayMessage;
  }

  if (
    lab &&
    lab.template &&
    lab?.template?.kubernetesClusters.length > 0 &&
    lab?.template?.virtualNetworks.length > 0 &&
    lab?.template?.kubernetesClusters[index]?.networkPluginMode !== "Overlay"
  ) {
    newTooltipMessage = "";
  }

  if (newTooltipMessage !== tooltipMessage) {
    setTooltipMessage(newTooltipMessage);
  }

  // Handle checkbox change
  function handleOnChange() {
    const newLab = structuredClone(lab);
    if (
      newLab?.template?.kubernetesClusters[index]?.addons?.appGateway ===
      undefined
    ) {
      return;
    }
    newLab.template.kubernetesClusters[index].addons.appGateway =
      !newLab.template.kubernetesClusters[index].addons.appGateway;
    !actionStatus.inProgress &&
      setLogs({ logs: JSON.stringify(newLab.template, null, 4) });
    setLab(newLab);
  }

  // If lab or template is undefined, return nothing
  if (!lab?.template) {
    return null;
  }

  // Determine checked and disabled states
  const checked =
    lab.template.kubernetesClusters[index]?.addons?.appGateway ?? false;
  const disabled =
    lab.template.kubernetesClusters.length === 0 ||
    lab.template.virtualNetworks.length === 0 ||
    lab.template.kubernetesClusters[index].networkPluginMode === "Overlay";

  return (
    <Checkbox
      id="toggle-appgateway"
      label="AGIC"
      checked={checked}
      disabled={disabled}
      tooltipMessage={tooltipMessage}
      tooltipDelay={200}
      handleOnChange={handleOnChange}
    />
  );
}
