import { useContext } from "react";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../Context/WebSocketContext";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";

type Props = {
  index: number;
};

export default function AutoScaling({ index }: Props) {
  const { lab, setLab } = useGlobalStateContext();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();

  // Toggle the auto scaling feature
  const handleOnChange = () => {
    const newLab = structuredClone(lab);
    const cluster = newLab?.template?.kubernetesClusters[index];
    if (
      cluster?.defaultNodePool?.enableAutoScaling !== undefined &&
      newLab !== undefined
    ) {
      cluster.defaultNodePool.enableAutoScaling =
        !cluster.defaultNodePool.enableAutoScaling;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(newLab?.template, null, 4) });
      setLab(newLab);
    }
  };

  // Determine checked and disabled states
  const checked =
    lab?.template?.kubernetesClusters[index]?.defaultNodePool
      ?.enableAutoScaling ?? false;
  const disabled = !lab?.template?.kubernetesClusters[index];

  // Render the Checkbox component if the lab template exists
  return lab?.template ? (
    <Checkbox
      id="toggle-autoscaling"
      label="Auto Scaling"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  ) : null; // Return null if the lab template does not exist
}
