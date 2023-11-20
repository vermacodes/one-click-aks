import { useContext } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../Context/WebSocketContext";

type Props = {
  index: number;
};

export default function AzureCNI({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  // Toggle the Azure CNI
  const handleOnChange = () => {
    const cluster = lab?.template?.kubernetesClusters[index];
    if (cluster?.networkPlugin !== undefined && lab !== undefined) {
      cluster.networkPlugin =
        cluster.networkPlugin === "azure" ? "kubenet" : "azure";
      cluster.networkPolicy =
        cluster.networkPlugin === "azure" ? "azure" : "null";
      cluster.networkPluginMode =
        cluster.networkPlugin === "azure" ? "null" : cluster.networkPluginMode;
      cluster.addons.virtualNode =
        cluster.networkPlugin === "azure" ? false : cluster.addons.virtualNode;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab?.template, null, 4) });
      setLab(lab);
    }
  };

  // Determine checked and disabled states
  const checked =
    lab?.template?.kubernetesClusters[index]?.networkPlugin === "azure";
  const disabled =
    labIsLoading || labIsFetching || !lab?.template?.kubernetesClusters[index];

  // Render the Checkbox component if the lab template exists
  return lab?.template ? (
    <Checkbox
      id="toggle-azurecni"
      label="Azure CNI"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  ) : null; // Return null if the lab template does not exist
}
