import { useContext, useState } from "react";
import { useSetLogs } from "../../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../../Context/WebSocketContext";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";

type Props = {
  index: number;
};

export default function NetworkPluginMode({ index }: Props) {
  const [tooltipMessage, setTooltipMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { lab, setLab } = useGlobalStateContext();

  const newLab = structuredClone(lab);

  const cluster = lab?.template?.kubernetesClusters[index];

  const noKubernetesClustersMessage =
    "You must create a Kubernetes cluster first.";
  const networkPluginNotAzureMessage = "Azure CNI required.";
  const networkPolicyNotAzureMessage = "Not supported with Calico";

  let newTooltipMessage = "";

  if (!cluster) {
    newTooltipMessage += noKubernetesClustersMessage + " ";
  }

  if (cluster?.networkPlugin !== "azure") {
    newTooltipMessage += networkPluginNotAzureMessage + " ";
  }

  if (cluster?.networkPolicy !== "azure") {
    newTooltipMessage += networkPolicyNotAzureMessage + " ";
  }

  if (
    cluster &&
    cluster.networkPlugin === "azure" &&
    cluster.networkPolicy === "azure"
  ) {
    newTooltipMessage = "";
  }

  if (newTooltipMessage !== tooltipMessage) {
    setTooltipMessage(newTooltipMessage);
  }

  // Handle checkbox change
  const handleOnChange = () => {
    if (cluster) {
      if (cluster.networkPluginMode === "Overlay") {
        cluster.networkPluginMode = "null";
      } else {
        cluster.networkPluginMode = "Overlay";
        cluster.addons.appGateway = false;
      }
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(newLab?.template, null, 4) });
      setLab(newLab);
    }
  };

  // Determine checked and disabled states
  const checked = cluster?.networkPluginMode === "Overlay";
  const disabled =
    !cluster ||
    cluster.networkPlugin !== "azure" ||
    cluster.networkPolicy !== "azure";

  // If lab or template is undefined, return nothing
  return lab?.template ? (
    <Checkbox
      id="toggle-overlay"
      label="Overlay"
      checked={checked}
      disabled={disabled}
      tooltipMessage={tooltipMessage}
      tooltipDelay={200}
      handleOnChange={handleOnChange}
    />
  ) : null;
}
