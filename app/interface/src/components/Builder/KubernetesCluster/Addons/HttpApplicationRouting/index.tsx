import { useContext } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../../WebSocketContext";
import { useSetLogs } from "../../../../../hooks/useLogs";

export default function HttpApplicationRouting() {
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLogs } = useSetLogs();
  const { mutate: setLab } = useSetLab();
  const { actionStatus } = useContext(WebSocketContext);

  function handleOnChange() {
    if (lab === undefined || lab.template === undefined) return;
    lab.template.kubernetesClusters[0].addons.httpApplicationRouting =
      !lab.template.kubernetesClusters[0].addons.httpApplicationRouting;

    !actionStatus.inProgress &&
      setLogs({
        logs: JSON.stringify(lab.template, null, 4),
      });

    setLab(lab);
  }

  if (lab === undefined || lab.template === undefined) return null;

  if (labIsFetching || labIsLoading) {
    return (
      <Checkbox
        id="toggle-httpapplicationrouting"
        label="Web App Routing (Managed Ingress Controller)"
        disabled={true}
        checked={false}
        handleOnChange={handleOnChange}
      />
    );
  }

  var checked: boolean = true;
  if (
    lab &&
    lab.template &&
    lab.template.kubernetesClusters.length > 0 &&
    lab.template.kubernetesClusters[0].addons &&
    lab.template.kubernetesClusters[0].addons.httpApplicationRouting === false
  ) {
    checked = false;
  }

  var disabled: boolean = false;
  if (lab && lab.template && lab.template.kubernetesClusters.length === 0) {
    disabled = true;
  }

  return (
    <Checkbox
      id="toggle-httpapplicationrouting"
      label="Web App Routing (Managed Ingress Controller)"
      disabled={disabled}
      checked={checked}
      handleOnChange={handleOnChange}
    />
  );
}
