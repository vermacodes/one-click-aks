import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../Checkbox";

export default function PrivateCluster() {
  const { data: inProgress } = useActionStatus();
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
        if (lab.template.kubernetesCluster.privateClusterEnabled === "true") {
          lab.template.kubernetesCluster.privateClusterEnabled = "false";
          lab.template.jumpservers = [];
        } else {
          lab.template.kubernetesCluster.privateClusterEnabled = "true";
        }
        !inProgress &&
          setLogs({
            isStreaming: false,
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
      checked={lab.template.kubernetesCluster.privateClusterEnabled === "true"}
      disabled={
        lab.template.virtualNetworks.length === 0 ||
        labIsLoading ||
        labIsFetching
      }
      handleOnChange={handleOnChange}
    />
  );
}
