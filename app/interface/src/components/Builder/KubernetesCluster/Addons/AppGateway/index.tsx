import { useContext } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import { useSetLogs } from "../../../../../hooks/useLogs";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function AppGateway({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  // Handle checkbox change
  function handleOnChange() {
    if (
      lab?.template?.kubernetesClusters[index]?.addons?.appGateway === undefined
    ) {
      return;
    }
    lab.template.kubernetesClusters[index].addons.appGateway =
      !lab.template.kubernetesClusters[index].addons.appGateway;
    !actionStatus.inProgress &&
      setLogs({ logs: JSON.stringify(lab.template, null, 4) });
    setLab(lab);
  }

  // If lab or template is undefined, return nothing
  if (!lab?.template) {
    return null;
  }

  // Determine checked and disabled states
  const checked =
    lab.template.kubernetesClusters[index]?.addons?.appGateway ?? false;
  const disabled =
    labIsLoading ||
    labIsFetching ||
    lab.template.kubernetesClusters.length === 0 ||
    lab.template.virtualNetworks.length === 0;

  return (
    <Checkbox
      id="toggle-appgateway"
      label="AGIC"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  );
}
