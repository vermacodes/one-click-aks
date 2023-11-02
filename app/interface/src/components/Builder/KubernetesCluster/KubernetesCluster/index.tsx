import { useState } from "react";
import { useLab } from "../../../../hooks/useLab";
import Version from "../Version";
import PrivateCluster from "../PrivateCluster";
import VirtualMachine from "../../VirtualMachine";
import AzureCNI from "../AzureCNI";
import Calico from "../Calico";
import NetworkPluginMode from "../../NetworkProfile/NetworkPluginMode";
import AutoScaling from "../AutoScaling";
import UserDefinedRouting from "../UserDefinedRouting";
import AppGateway from "../Addons/AppGateway";
import MicrosoftDefender from "../Addons/MicrosoftDefender";
import VirtualNode from "../Addons/VirtualNode";
import HttpApplicationRouting from "../Addons/HttpApplicationRouting";
import BuilderContainer from "../../../UserInterfaceComponents/BuilderContainer";

export default function KubernetesCluster() {
  const [versionMenu, setVersionMenu] = useState<boolean>(false);
  const { data: lab } = useLab();

  if (
    lab === undefined ||
    lab.template === undefined ||
    lab.template.kubernetesClusters === undefined ||
    lab.template.kubernetesClusters.length === 0
  ) {
    return null;
  }

  return (
    <BuilderContainer title="Kubernetes Cluster">
      <BuilderContainer title="Features">
        <div className={`mt-4 flex flex-wrap gap-x-2 gap-y-2`}>
          <Version versionMenu={versionMenu} setVersionMenu={setVersionMenu} />
          <PrivateCluster />
          <VirtualMachine />
          <AzureCNI />
          <Calico />
          <NetworkPluginMode />
          <AutoScaling />
          <UserDefinedRouting />
        </div>
      </BuilderContainer>
      <BuilderContainer title="Addons">
        <div className={`mt-4 flex flex-wrap gap-x-2 gap-y-2`}>
          <AppGateway />
          <MicrosoftDefender />
          <VirtualNode />
          <HttpApplicationRouting />
        </div>
      </BuilderContainer>
    </BuilderContainer>
  );
}
