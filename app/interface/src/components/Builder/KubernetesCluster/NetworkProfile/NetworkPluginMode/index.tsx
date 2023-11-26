import { useContext, useState } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import { useSetLogs } from "../../../../../hooks/useLogs";
import { WebSocketContext } from "../../../../Context/WebSocketContext";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";

type Props = {
  index: number;
};

export default function NetworkPluginMode({ index }: Props) {
  const [tooltipMessage, setTooltipMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

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
      cluster.networkPluginMode =
        cluster.networkPluginMode === "null" ? "Overlay" : "null";
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab?.template, null, 4) });
      setLab(lab);
    }
  };

  // Determine checked and disabled states
  const checked = cluster?.networkPluginMode === "Overlay";
  const disabled =
    labIsLoading ||
    labIsFetching ||
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
