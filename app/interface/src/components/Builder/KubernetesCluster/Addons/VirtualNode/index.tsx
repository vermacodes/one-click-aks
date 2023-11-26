import { useContext, useState } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import { useSetLogs } from "../../../../../hooks/useLogs";
import { WebSocketContext } from "../../../../Context/WebSocketContext";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";

type Props = {
  index: number;
};

export default function VirtualNode({ index }: Props) {
  const [tooltipMessage, setTooltipMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  const noKubernetesClustersMessage =
    "You must create a Kubernetes cluster first.";
  const networkPluginNotAzureMessage = "Azure CNI required.";

  let newTooltipMessage = "";

  if (lab?.template?.kubernetesClusters.length === 0) {
    newTooltipMessage += noKubernetesClustersMessage;
  }

  if (lab?.template?.kubernetesClusters[index]?.networkPlugin !== "azure") {
    newTooltipMessage += networkPluginNotAzureMessage;
  }

  if (
    lab &&
    lab.template &&
    lab?.template?.kubernetesClusters.length > 0 &&
    lab?.template?.kubernetesClusters[index]?.networkPlugin === "azure"
  ) {
    newTooltipMessage = "";
  }

  if (newTooltipMessage !== tooltipMessage) {
    setTooltipMessage(newTooltipMessage);
  }

  // Toggle the virtual node addon
  const handleOnChange = () => {
    const cluster = lab?.template?.kubernetesClusters[index];
    if (cluster?.addons?.virtualNode !== undefined && lab !== undefined) {
      cluster.addons.virtualNode = !cluster.addons.virtualNode;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab?.template, null, 4) });
      setLab(lab);
    }
  };

  // Determine checked and disabled states
  const checked =
    lab?.template?.kubernetesClusters[index]?.addons?.virtualNode ?? false;
  const disabled =
    labIsLoading ||
    labIsFetching ||
    lab?.template?.kubernetesClusters[index]?.networkPlugin !== "azure";

  // Render the Checkbox component if the lab template exists
  return lab?.template ? (
    <Checkbox
      id="toggle-virtual-node"
      label="VirtualNode"
      checked={checked}
      disabled={disabled}
      tooltipMessage={tooltipMessage}
      tooltipDelay={200}
      handleOnChange={handleOnChange}
    />
  ) : null; // Return null if the lab template does not exist
}
