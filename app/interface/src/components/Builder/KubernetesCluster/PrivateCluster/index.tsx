import { useContext } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function PrivateCluster({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  // Toggle the private cluster feature
  const handleOnChange = () => {
    const cluster = lab?.template?.kubernetesClusters[index];
    if (
      cluster?.privateClusterEnabled !== undefined &&
      lab !== undefined &&
      lab?.template !== undefined
    ) {
      cluster.privateClusterEnabled =
        cluster.privateClusterEnabled === "true" ? "false" : "true";
      lab.template.jumpservers =
        cluster.privateClusterEnabled === "true"
          ? []
          : lab.template.jumpservers;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab?.template, null, 4) });
      setLab(lab);
    }
  };

  // Determine checked and disabled states
  const checked =
    lab?.template?.kubernetesClusters[index]?.privateClusterEnabled === "true";
  const disabled =
    labIsLoading ||
    labIsFetching ||
    !lab?.template?.kubernetesClusters[index] ||
    lab?.template?.virtualNetworks.length === 0;

  // Render the Checkbox component if the lab template exists
  return lab?.template ? (
    <Checkbox
      id="toggle-privatecluster"
      label="Private Cluster"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  ) : null; // Return null if the lab template does not exist
}
