import { useContext, useState } from "react";
import { TfvarKubernetesClusterType } from "../../../../dataStructures";
import { useActionStatus } from "../../../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGetOrchestrators } from "../../../../hooks/useOrchestrators";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import {
  defaultKubernetesCluster,
  defaultTfvarConfig,
} from "../../../../defaults";
import { WebSocketContext } from "../../../../WebSocketContext";
import Version from "../Version";
import PrivateCluster from "../PrivateCluster";
import JumpServer from "../../JumpServer";
import AzureCNI from "../AzureCNI";
import Calico from "../Calico";
import NetworkPluginMode from "../../NetworkProfile/NetworkPluginMode";
import AutoScaling from "../AutoScaling";
import UserDefinedRouting from "../UserDefinedRouting";
import AppGateway from "../Addons/AppGateway";
import MicrosoftDefender from "../Addons/MicrosoftDefender";
import VirtualNode from "../Addons/VirtualNode";
import HttpApplicationRouting from "../Addons/HttpApplicationRouting";

export default function AddKubernetesCluster() {
  const [versionMenu, setVersionMenu] = useState<boolean>(false);
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

  if (
    lab === undefined ||
    lab.template === undefined ||
    lab.template.kubernetesClusters === undefined ||
    lab.template.kubernetesClusters.length === 0
  ) {
    return (
      <>
        <Checkbox
          id="toggle-aks"
          label="AKS"
          checked={false}
          disabled={false}
          handleOnChange={handleOnChange}
        />
      </>
    );
  }

  return (
    <Checkbox
      id="toggle-aks"
      label="AKS"
      checked={true}
      disabled={false}
      handleOnChange={handleOnChange}
    />
  );
}
