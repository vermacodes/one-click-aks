import { useContext } from "react";
import { useSetLogs } from "../../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../../Context/WebSocketContext";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";

type Props = { index: number };

export default function HttpApplicationRouting({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { lab, setLab } = useGlobalStateContext();

  const newLab = structuredClone(lab);
  const cluster = newLab?.template?.kubernetesClusters[index];

  // Handle checkbox change
  const handleOnChange = () => {
    // If the cluster and its addons exist
    if (cluster?.addons && newLab !== undefined) {
      // Toggle the httpApplicationRouting addon
      cluster.addons.httpApplicationRouting =
        !cluster.addons.httpApplicationRouting;

      // If there's no action in progress, set the logs with the updated lab template
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(newLab?.template, null, 4) });

      // Update the lab data with the updated cluster
      setLab(newLab);
    }
  };

  // Determine checked and disabled states
  const checked = cluster?.addons?.httpApplicationRouting ?? false;
  const disabled = !cluster;

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
