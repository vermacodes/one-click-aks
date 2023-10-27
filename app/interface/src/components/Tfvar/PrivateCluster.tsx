import { useContext } from "react";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../WebSocketContext";

export default function PrivateCluster() {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  function handleOnChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (
          lab.template.kubernetesClusters[0].privateClusterEnabled === "true"
        ) {
          lab.template.kubernetesClusters[0].privateClusterEnabled = "false";
          lab.template.jumpservers = [];
        } else {
          lab.template.kubernetesClusters[0].privateClusterEnabled = "true";
        }
        !actionStatus.inProgress &&
          setLogs({
            logs: JSON.stringify(lab.template, null, 4),
          });
        setLab(lab);
      }
    }
  }

  if (lab === undefined || lab.template === undefined) {
    return <></>;
  }

  if (labIsLoading || labIsFetching) {
    return (
      <Checkbox
        id="toogle-privatecluster"
        label="Private Cluster"
        disabled={true}
        checked={false}
        handleOnChange={handleOnChange}
      />
    );
  }

  return (
    <Checkbox
      id="toogle-privatecluster"
      label="Private Cluster"
      checked={
        lab.template.kubernetesClusters.length > 0 &&
        lab.template.kubernetesClusters[0].privateClusterEnabled === "true"
      }
      disabled={
        lab.template.kubernetesClusters.length === 0 ||
        lab.template.virtualNetworks.length === 0 ||
        labIsLoading ||
        labIsFetching
      }
      handleOnChange={handleOnChange}
    />
  );
}
