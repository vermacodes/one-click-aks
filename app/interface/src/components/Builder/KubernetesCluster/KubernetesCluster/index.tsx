import { useGlobalStateContext } from "../../../Context/GlobalStateContext";
import Container from "../../../UserInterfaceComponents/Container";
import AppGateway from "../Addons/AppGateway";
import HttpApplicationRouting from "../Addons/HttpApplicationRouting";
import MicrosoftDefender from "../Addons/MicrosoftDefender";
import ServiceMesh from "../Addons/ServiceMesh";
import VirtualNode from "../Addons/VirtualNode";
import AutoScaling from "../AutoScaling";
import AzureCNI from "../AzureCNI";
import Calico from "../Calico";
import NetworkPluginMode from "../NetworkProfile/NetworkPluginMode";
import PrivateCluster from "../PrivateCluster";
import UserDefinedRouting from "../UserDefinedRouting";
import Version from "../Version";

export default function KubernetesCluster() {
  const { lab } = useGlobalStateContext();

  // If lab or its template or kubernetesClusters is undefined or empty, return null
  if (!lab?.template?.kubernetesClusters?.length) {
    return null;
  }

  return (
    <>
      {lab.template.kubernetesClusters.map((cluster, index) => (
        <Container
          key={index + "cluster"}
          title={`Kubernetes Cluster ${index + 1}`}
          additionalClasses="outline outline-slate-300 dark:outline-slate-700 flex"
          additionalContainerBodyClasses="flex flex-col gap-4"
          hoverEffect={false}
          collapsible={true}
        >
          <Container
            key={index + "features"}
            title="Features"
            additionalClasses="outline outline-slate-300 dark:outline-slate-700 flex"
            additionalContainerBodyClasses="flex flex-col gap-4"
            hoverEffect={false}
            collapsible={true}
          >
            <div className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-2`}>
              <Version index={index} />
              <PrivateCluster index={index} />
              <AzureCNI index={index} />
              <Calico index={index} />
              <NetworkPluginMode index={index} />
              <AutoScaling index={index} />
              <UserDefinedRouting index={index} />
            </div>
          </Container>
          <Container
            key={index + "addons"}
            title="Addons"
            additionalClasses="outline outline-slate-300 dark:outline-slate-700 flex"
            additionalContainerBodyClasses="flex flex-col gap-4"
            hoverEffect={false}
            collapsible={true}
          >
            <div className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-2`}>
              <AppGateway index={index} />
              <ServiceMesh index={index} />
              <MicrosoftDefender index={index} />
              <VirtualNode index={index} />
              <HttpApplicationRouting index={index} />
            </div>
          </Container>
        </Container>
      ))}
    </>
  );
}
