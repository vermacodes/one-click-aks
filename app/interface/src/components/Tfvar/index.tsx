import { useState } from "react";
import { Lab } from "../../dataStructures";
import { useDeleteLab, useLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import CodeEditor from "../../modals/CodeEditor";
import LabBuilder from "../../modals/LabBuilder";
import Button from "../Button";
import ExportLabInBuilder from "../Lab/Export/ExportLabInBuilder";
import ImportLabToBuilder from "../Lab/Import/ImportLabToBuilder";
import ApplyButton from "../Terraform/ApplyButton";
import DestroyButton from "../Terraform/DestroyButton";
import PlanButton from "../Terraform/PlanButton";
import AppGateway from "./Addons/AppGateway";
import MicrosoftDefender from "./Addons/MicrosoftDefender";
import AutoScaling from "./AutoScaling";
import AzureCNI from "./AzureCNI";
import AzureFirewall from "./AzureFirewall";
import Calico from "./Calico";
import ContainerRegistry from "./ContainerRegistry";
import CustomVnet from "./CustomVnet";
import JumpServer from "./JumpServer";
import KubernetesCluster from "./KubernetesCluster";
import KubernetesVersion from "./KubernetesVersion";
import NetworkPluginMode from "./NetworkProfile/NetworkPluginMode";
import PrivateCluster from "./PrivateCluster";
import UserDefinedRouting from "./UserDefinedRouting";

export default function Tfvar() {
  const [versionMenu, setVersionMenu] = useState<boolean>(false);

  const { mutate: setLogs } = useSetLogs();
  const { data: lab } = useLab();
  const { mutate: deleteLab } = useDeleteLab();

  const [_lab, _setLab] = useState<Lab | undefined>(lab);

  return (
    <div
      onClick={() => setVersionMenu(false)}
      className={`rounded border border-slate-500 p-3 shadow-sm hover:border-sky-500 hover:shadow-sky-500`}
    >
      <div className="flex flex-wrap gap-y-2 gap-x-2">
        <CustomVnet />
        <ContainerRegistry />
        <AzureFirewall />
        <KubernetesCluster />
      </div>
      <div
        className={`${
          lab?.template?.kubernetesClusters.length === 0 && "hidden"
        } mt-4 flex flex-wrap gap-x-2 gap-y-2`}
      >
        <KubernetesVersion
          versionMenu={versionMenu}
          setVersionMenu={setVersionMenu}
        />
        <PrivateCluster />
        <JumpServer />
        <AzureCNI />
        <Calico />
        <NetworkPluginMode />
        <AutoScaling />
        <UserDefinedRouting />
        <AppGateway />
        <MicrosoftDefender />
      </div>
      <div className={`mt-4 flex flex-wrap gap-2`}>
        <PlanButton variant="success" lab={lab}>
          Plan
        </PlanButton>
        <ApplyButton variant="primary" lab={lab}>
          Deploy
        </ApplyButton>
        <DestroyButton variant="danger" lab={lab}>
          Destroy
        </DestroyButton>
        <CodeEditor variant="secondary">Extention</CodeEditor>
        <LabBuilder variant="secondary">Save</LabBuilder>
        <Button
          variant="secondary"
          onClick={() => {
            setLogs({ isStreaming: false, logs: "" });
            deleteLab();
          }}
        >
          Reset
        </Button>
        <ExportLabInBuilder variant="secondary">Export</ExportLabInBuilder>
        <ImportLabToBuilder />
      </div>
    </div>
  );
}
