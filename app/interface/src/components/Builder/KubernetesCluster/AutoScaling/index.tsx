import { useContext } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../Context/WebSocketContext";

type Props = {
  index: number;
};

export default function AutoScaling({ index }: Props) {
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();

  // Toggle the auto scaling feature
  const handleOnChange = () => {
    const cluster = lab?.template?.kubernetesClusters[index];
    if (
      cluster?.defaultNodePool?.enableAutoScaling !== undefined &&
      lab !== undefined
    ) {
      cluster.defaultNodePool.enableAutoScaling =
        !cluster.defaultNodePool.enableAutoScaling;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab?.template, null, 4) });
      setLab(lab);
    }
  };

  // Determine checked and disabled states
  const checked =
    lab?.template?.kubernetesClusters[index]?.defaultNodePool
      ?.enableAutoScaling ?? false;
  const disabled =
    labIsLoading || labIsFetching || !lab?.template?.kubernetesClusters[index];

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
