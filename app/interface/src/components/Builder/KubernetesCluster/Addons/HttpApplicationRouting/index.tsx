import { useContext } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../Context/WebSocketContext";
import { useSetLogs } from "../../../../../hooks/useLogs";

type Props = { index: number };

export default function HttpApplicationRouting({ index }: Props) {
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
    // If the cluster and its addons exist
    if (cluster?.addons && lab !== undefined) {
      // Toggle the httpApplicationRouting addon
      cluster.addons.httpApplicationRouting =
        !cluster.addons.httpApplicationRouting;

      // If there's no action in progress, set the logs with the updated lab template
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab?.template, null, 4) });

      // Update the lab data with the updated cluster
      setLab(lab);
    }
  };

  // Determine checked and disabled states
  const checked = cluster?.addons?.httpApplicationRouting ?? false;
  const disabled = labIsLoading || labIsFetching || !cluster;

  // Render the Checkbox component if the lab template exists
  return lab?.template ? (
    <Checkbox
      id="toggle-httpapplicationrouting"
      label="Web App Routing (Managed Ingress Controller)"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  ) : null; // Return null if the lab template does not exist
}
