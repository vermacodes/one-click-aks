import { useContext } from "react";
import { TfvarKubernetesClusterType } from "../../../../dataStructures";
import { getDefaultKubernetesCluster } from "../../../../defaults";
import { useKubernetesVersions } from "../../../../hooks/useKubernetesVersions";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../Context/WebSocketContext";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";

export default function AddKubernetesCluster() {
  const { lab, setLab } = useGlobalStateContext();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();

  const { defaultVersion } = useKubernetesVersions();

  // The default value that kubernetes cluster will carry.
  function defaultValue(): TfvarKubernetesClusterType {
    const deepCopy = getDefaultKubernetesCluster();
    return {
      ...deepCopy,
      kubernetesVersion: defaultVersion,
    };
  }

  function handleOnChange() {
    const newLab = structuredClone(lab);
    if (newLab?.template) {
      newLab.template.kubernetesClusters =
        newLab.template.kubernetesClusters?.length === 0
          ? [defaultValue()]
          : [];
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(newLab.template, null, 4) });
      setLab(newLab);
    }
  }

  const disabled = false;
  const checked = (lab?.template?.kubernetesClusters?.length ?? 0) > 0;

  return (
    <Checkbox
      id="toggle-aks"
      label="Kubernetes Cluster"
      checked={checked || false}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  );
}
