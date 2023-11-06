import { useContext } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function UserDefinedRouting({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  // Toggle the outbound type between 'userDefinedRouting' and 'loadBalancer'
  const handleOnChange = () => {
    const cluster = lab?.template?.kubernetesClusters[index];
    if (cluster?.outboundType !== undefined && lab !== undefined) {
      cluster.outboundType =
        cluster.outboundType === "userDefinedRouting"
          ? "loadBalancer"
          : "userDefinedRouting";
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab?.template, null, 4) });
      setLab(lab);
    }
  };

  // Determine checked and disabled states
  const checked =
    lab?.template?.kubernetesClusters[index]?.outboundType ===
    "userDefinedRouting";
  const disabled =
    labIsLoading ||
    labIsFetching ||
    !lab?.template?.kubernetesClusters[index] ||
    lab?.template?.virtualNetworks.length === 0 ||
    lab?.template?.firewalls.length === 0;

  // Render the Checkbox component if the lab template exists
  return lab?.template ? (
    <Checkbox
      id="toggle-udr"
      label="UDR"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  ) : null; // Return null if the lab template does not exist
}
