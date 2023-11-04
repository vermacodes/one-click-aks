import { useContext } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function PrivateCluster({ index }: Props) {
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
          lab.template.kubernetesClusters[index].privateClusterEnabled ===
          "true"
        ) {
          lab.template.kubernetesClusters[index].privateClusterEnabled =
            "false";
          lab.template.jumpservers = [];
        } else {
          lab.template.kubernetesClusters[index].privateClusterEnabled = "true";
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
        id="toggle-privatecluster"
        label="Private Cluster"
        disabled={true}
        checked={false}
        handleOnChange={handleOnChange}
      />
    );
  }

  return (
    <Checkbox
      id="toggle-privatecluster"
      label="Private Cluster"
      checked={
        lab.template.kubernetesClusters.length > 0 &&
        lab.template.kubernetesClusters[index].privateClusterEnabled === "true"
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
