import { useContext, useState } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../WebSocketContext";
import Tooltip from "../../../UserInterfaceComponents/Tooltip";

type Props = {
  index: number;
};

export default function Calico({ index }: Props) {
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
  const networkPluginKubenetMessage = "Only supported with Azure CNI.";

  let newTooltipMessage = "";

  if (lab?.template?.kubernetesClusters.length === 0) {
    newTooltipMessage += noKubernetesClustersMessage;
  }

  if (lab?.template?.kubernetesClusters[index]?.networkPlugin === "kubenet") {
    newTooltipMessage += networkPluginKubenetMessage;
  }

  if (
    lab &&
    lab.template &&
    lab?.template?.kubernetesClusters.length > 0 &&
    lab?.template?.kubernetesClusters[index]?.networkPlugin !== "kubenet"
  ) {
    newTooltipMessage = "";
  }

  if (newTooltipMessage !== tooltipMessage) {
    setTooltipMessage(newTooltipMessage);
  }

  // Toggle the Calico network policy
  const handleOnChange = () => {
    const cluster = lab?.template?.kubernetesClusters[index];
    if (cluster?.networkPolicy !== undefined && lab !== undefined) {
      cluster.networkPolicy =
        cluster.networkPolicy === "calico" ? "azure" : "calico";
      cluster.networkPluginMode =
        cluster.networkPolicy === "calico" ? "null" : cluster.networkPluginMode;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab?.template, null, 4) });
      setLab(lab);
    }
  };

  // Determine checked and disabled states
  const checked =
    lab?.template?.kubernetesClusters[index]?.networkPolicy === "calico";
  const disabled =
    labIsLoading ||
    labIsFetching ||
    !lab?.template?.kubernetesClusters[index] ||
    lab?.template?.kubernetesClusters[index]?.networkPlugin === "kubenet";

  // Render the Checkbox component if the lab template exists
  return lab?.template ? (
    <Checkbox
      id="toggle-calico"
      label="Calico"
      checked={checked}
      disabled={disabled}
      tooltipMessage={tooltipMessage}
      tooltipDelay={200}
      handleOnChange={handleOnChange}
    />
  ) : null; // Return null if the lab template does not exist
}
