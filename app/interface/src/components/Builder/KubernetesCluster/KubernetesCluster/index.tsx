import { useState } from "react";
import { useLab } from "../../../../hooks/useLab";
import Version from "../Version";
import PrivateCluster from "../PrivateCluster";
import VirtualMachine from "../../VirtualMachine";
import AzureCNI from "../AzureCNI";
import Calico from "../Calico";
import NetworkPluginMode from "../NetworkProfile/NetworkPluginMode";
import AutoScaling from "../AutoScaling";
import UserDefinedRouting from "../UserDefinedRouting";
import AppGateway from "../Addons/AppGateway";
import MicrosoftDefender from "../Addons/MicrosoftDefender";
import VirtualNode from "../Addons/VirtualNode";
import HttpApplicationRouting from "../Addons/HttpApplicationRouting";
import BuilderContainer from "../../../UserInterfaceComponents/BuilderContainer";
import ServiceMesh from "../Addons/ServiceMesh";

export default function KubernetesCluster() {
  const { data: lab } = useLab();

  // If lab or its template or kubernetesClusters is undefined or empty, return null
  if (!lab?.template?.kubernetesClusters?.length) {
    return null;
  }

  return (
    <>
      {lab.template.kubernetesClusters.map((cluster, index) => (
        <BuilderContainer key={index} title={`Kubernetes Cluster ${index + 1}`}>
          <BuilderContainer key={index} title="Features">
            <div className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-2`}>
              <Version index={index} />
              <PrivateCluster index={index} />
              <VirtualMachine />
              <AzureCNI index={index} />
              <Calico index={index} />
              <NetworkPluginMode index={index} />
              <AutoScaling index={index} />
              <UserDefinedRouting index={index} />
            </div>
          </BuilderContainer>
          <BuilderContainer title="Addons">
            <div className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-2`}>
              <AppGateway index={index} />
              <ServiceMesh index={index} />
              <MicrosoftDefender index={index} />
              <VirtualNode index={index} />
              <HttpApplicationRouting index={index} />
            </div>
          </BuilderContainer>
        </BuilderContainer>
      ))}
    </>
  );
}
