import { useContext } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import { useSetLogs } from "../../../../../hooks/useLogs";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../../WebSocketContext";

type Props = { index: number };

export default function NetworkPluginMode({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  const cluster = lab?.template?.kubernetesClusters[index];

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
      handleOnChange={handleOnChange}
    />
  ) : null;
}
