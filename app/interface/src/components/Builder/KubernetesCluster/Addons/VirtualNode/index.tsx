import { useContext } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import { useSetLogs } from "../../../../../hooks/useLogs";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function VirtualNode({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

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
      handleOnChange={handleOnChange}
    />
  ) : null; // Return null if the lab template does not exist
}
