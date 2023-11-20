import { useContext } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../Context/WebSocketContext";
import { useSetLogs } from "../../../../../hooks/useLogs";

type Props = { index: number };

export default function MicrosoftDefender({ index }: Props) {
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
    if (cluster?.addons && lab !== undefined) {
      cluster.addons.microsoftDefender = !cluster.addons.microsoftDefender;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab?.template, null, 4) });
      setLab(lab);
    }
  };

  // Determine checked and disabled states
  const checked = cluster?.addons?.microsoftDefender ?? false;
  const disabled = labIsLoading || labIsFetching || !cluster;

  return lab?.template ? (
    <Checkbox
      id="toggle-defender"
      label="Microsoft Defender"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  ) : null;
}
