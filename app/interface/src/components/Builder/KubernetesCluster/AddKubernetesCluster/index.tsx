import { useContext } from "react";
import { TfvarKubernetesClusterType } from "../../../../dataStructures";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGetOrchestrators } from "../../../../hooks/useOrchestrators";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { defaultKubernetesCluster } from "../../../../defaults";
import { WebSocketContext } from "../../../Context/WebSocketContext";

export default function AddKubernetesCluster() {
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
    const defaultVersion = kubernetesVersion?.values
      ? Object.keys(kubernetesVersion.values[0].patchVersions)[0]
      : "";
    return { ...defaultKubernetesCluster, kubernetesVersion: defaultVersion };
  }

  function handleOnChange() {
    if (lab?.template) {
      lab.template.kubernetesClusters =
        lab.template.kubernetesClusters?.length === 0 ? [defaultValue()] : [];
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab.template, null, 4) });
      setLab(lab);
    }
  }

  const disabled = labIsLoading || labIsFetching;
  const checked = (lab?.template?.kubernetesClusters?.length ?? 0) > 0;

  return (
    <Checkbox
      id="toggle-aks"
      label="AKS"
      checked={checked || false}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  );
}
