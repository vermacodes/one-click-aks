import { useContext, useState } from "react";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../Context/WebSocketContext";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";

type Props = {
  index: number;
};

const TRUE = "true";
const FALSE = "false";

export default function PrivateCluster({ index }: Props) {
  const [tooltipMessage, setTooltipMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { lab, setLab } = useGlobalStateContext();

  const virtualNetworkRequiredMessage =
    "You must create a virtual network first.";

  const handleOnChange = () => {
    const newLab = { ...lab };
    if (newLab && newLab.template && !actionStatus.inProgress) {
      const cluster = newLab.template.kubernetesClusters[index];
      if (cluster && cluster.privateClusterEnabled !== undefined) {
        cluster.privateClusterEnabled =
          cluster.privateClusterEnabled === TRUE ? FALSE : TRUE;
        newLab.template.jumpservers =
          cluster.privateClusterEnabled === TRUE
            ? []
            : newLab.template.jumpservers;
        setLogs({ logs: JSON.stringify(newLab.template, null, 4) });
        setLab(newLab);
      }
    }
  };

  const hasVirtualNetworks =
    lab && lab.template && lab?.template?.virtualNetworks.length > 0;
  const hasCluster = Boolean(lab?.template?.kubernetesClusters[index]);
  const checked =
    lab?.template?.kubernetesClusters[index]?.privateClusterEnabled === TRUE;
  const disabled = !hasCluster || !hasVirtualNetworks;

  // Tooltip message
  if (!hasVirtualNetworks && tooltipMessage !== virtualNetworkRequiredMessage) {
    setTooltipMessage(virtualNetworkRequiredMessage);
  }

  if (hasVirtualNetworks && tooltipMessage) {
    setTooltipMessage("");
  }

  return lab?.template ? (
    <Checkbox
      id="toggle-privatecluster"
      label="Private Cluster"
      checked={checked}
      disabled={disabled}
      tooltipMessage={tooltipMessage}
      tooltipDelay={200}
      handleOnChange={handleOnChange}
    />
  ) : null;
}
