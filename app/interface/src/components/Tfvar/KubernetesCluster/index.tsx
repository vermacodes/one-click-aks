import { useContext } from "react";
import { TfvarKubernetesClusterType } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import { useGetOrchestrators } from "../../../hooks/useOrchestrators";
import Checkbox from "../../Checkbox";
import { defaultKubernetesCluster, defaultTfvarConfig } from "../defaults";
import { WebSocketContext } from "../../../WebSocketContext";

export default function KubernetesCluster() {
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();

  const { data: kubernetesVersion } = useGetOrchestrators();

  // The default value that kubernetes cluster will carry.
  function defaultValue(): TfvarKubernetesClusterType {
    var defaultVersion = "";
    if (kubernetesVersion && kubernetesVersion.values) {
      defaultVersion = Object.keys(
        kubernetesVersion.values[0].patchVersions
      )[0];
    }

    return { ...defaultKubernetesCluster, kubernetesVersion: defaultVersion };
  }

  function handleOnChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (lab.template.kubernetesClusters.length === 0) {
          lab.template.kubernetesClusters = [defaultValue()];
        } else {
          lab.template.kubernetesClusters = [];
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
        id="toggle-aks"
        label="AKS"
        disabled={true}
        checked={false}
        handleOnChange={handleOnChange}
      />
    );
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-aks"
          label="AKS"
          checked={lab.template.kubernetesClusters.length > 0}
          disabled={labIsLoading || labIsFetching}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
