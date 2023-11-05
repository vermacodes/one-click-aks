import { useContext } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function Calico({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

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
      handleOnChange={handleOnChange}
    />
  ) : null; // Return null if the lab template does not exist
}
