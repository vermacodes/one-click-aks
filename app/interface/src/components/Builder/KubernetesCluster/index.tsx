import { useContext, useState } from "react";
import { TfvarKubernetesClusterType } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import { useGetOrchestrators } from "../../../hooks/useOrchestrators";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import {
  defaultKubernetesCluster,
  defaultTfvarConfig,
} from "../../../defaults";
import { WebSocketContext } from "../../../WebSocketContext";
import Version from "./Version";
import PrivateCluster from "./PrivateCluster";
import JumpServer from "../JumpServer";
import AzureCNI from "./AzureCNI";
import Calico from "./Calico";
import NetworkPluginMode from "../NetworkProfile/NetworkPluginMode";
import AutoScaling from "./AutoScaling";
import UserDefinedRouting from "./UserDefinedRouting";
import AppGateway from "./Addons/AppGateway";
import MicrosoftDefender from "./Addons/MicrosoftDefender";
import VirtualNode from "./Addons/VirtualNode";
import HttpApplicationRouting from "./Addons/HttpApplicationRouting";

export default function KubernetesCluster() {
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

  // if (lab === undefined || lab.template === undefined) {
  //   return <></>;
  // }
  // var isClusterAdded: boolean = true;
  // if (
  //   lab === undefined ||
  //   lab.template === undefined ||
  //   lab.template.kubernetesClusters === undefined ||
  //   lab.template.kubernetesClusters.length === 0
  // ) {
  //   isClusterAdded = false;
  // }

  if (
    // labIsLoading ||
    // labIsFetching ||
    lab === undefined ||
    lab.template === undefined ||
    lab.template.kubernetesClusters === undefined ||
    lab.template.kubernetesClusters.length === 0
  ) {
    return null;
  }

  // // if (
  // //   lab === undefined ||
  // //   lab.template === undefined ||
  // //   lab.template.kubernetesClusters === undefined ||
  // //   lab.template.kubernetesClusters.length === 0
  // // ) {
  // //   return (
  // //     <>
  // //       <Checkbox
  // //         id="toggle-aks"
  // //         label="AKS"
  // //         checked={false}
  // //         disabled={false}
  // //         handleOnChange={handleOnChange}
  // //       />
  // //     </>
  // //   );
  // // }

  return (
    <div className={`my-4 flex flex-wrap gap-x-2 gap-y-2 border p-4 shadow`}>
      <p className="text-lg font-bold">Kubernetes Cluster </p>
      <div
        className={`mt-4 flex w-full flex-col gap-x-2 gap-y-2 border p-4 shadow`}
      >
        <p className="text-lg font-bold">Features </p>
        <div className={`mt-4 flex flex-wrap gap-x-2 gap-y-2`}>
          <Version versionMenu={versionMenu} setVersionMenu={setVersionMenu} />
          <PrivateCluster />
          <JumpServer />
          <AzureCNI />
          <Calico />
          <NetworkPluginMode />
          <AutoScaling />
          <UserDefinedRouting />
        </div>
      </div>
      <div
        className={`mt-4 flex w-full flex-col gap-x-2 gap-y-2 border p-4 shadow`}
      >
        <p className="text-lg font-bold">Addons </p>
        <div className={`mt-4 flex flex-wrap gap-x-2 gap-y-2`}>
          <AppGateway />
          <MicrosoftDefender />
          <VirtualNode />
          <HttpApplicationRouting />
        </div>
      </div>
    </div>
  );
}
