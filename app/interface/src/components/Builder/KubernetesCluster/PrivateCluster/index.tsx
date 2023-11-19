import { useContext, useState } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../Context/WebSocketContext";
import Tooltip from "../../../UserInterfaceComponents/Tooltip";

type Props = {
  index: number;
};

const TRUE = "true";
const FALSE = "false";

export default function PrivateCluster({ index }: Props) {
  const [tooltipMessage, setTooltipMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  const virtualNetworkRequiredMessage =
    "You must create a virtual network first.";

  const handleOnChange = () => {
    if (lab && lab.template && !actionStatus.inProgress) {
      const cluster = lab.template.kubernetesClusters[index];
      if (cluster && cluster.privateClusterEnabled !== undefined) {
        cluster.privateClusterEnabled =
          cluster.privateClusterEnabled === TRUE ? FALSE : TRUE;
        lab.template.jumpservers =
          cluster.privateClusterEnabled === TRUE
            ? []
            : lab.template.jumpservers;
        setLogs({ logs: JSON.stringify(lab.template, null, 4) });
        setLab(lab);
      }
    }
  };

  const hasVirtualNetworks =
    lab && lab.template && lab?.template?.virtualNetworks.length > 0;
  const hasCluster = Boolean(lab?.template?.kubernetesClusters[index]);
  const checked =
    lab?.template?.kubernetesClusters[index]?.privateClusterEnabled === TRUE;
  const disabled =
    labIsLoading || labIsFetching || !hasCluster || !hasVirtualNetworks;

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
