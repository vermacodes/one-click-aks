import { useContext } from "react";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../Context/WebSocketContext";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";

type Props = {
  index: number;
};

export default function AzureCNI({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { lab, setLab } = useGlobalStateContext();

  // Toggle the Azure CNI
  const handleOnChange = () => {
    const newLab = structuredClone(lab);
    const cluster = newLab?.template?.kubernetesClusters[index];
    if (cluster?.networkPlugin !== undefined && newLab !== undefined) {
      cluster.networkPlugin =
        cluster.networkPlugin === "azure" ? "kubenet" : "azure";
      cluster.networkPolicy =
        cluster.networkPlugin === "azure" ? "azure" : "null";
      cluster.networkPluginMode =
        cluster.networkPlugin === "azure" ? "null" : cluster.networkPluginMode;
      cluster.addons.virtualNode =
        cluster.networkPlugin === "azure" ? false : cluster.addons.virtualNode;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(newLab?.template, null, 4) });
      setLab(newLab);
    }
  };

  // Determine checked and disabled states
  const checked =
    lab?.template?.kubernetesClusters[index]?.networkPlugin === "azure";
  const disabled = !lab?.template?.kubernetesClusters[index];

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
