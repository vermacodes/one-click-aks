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
import AppGateway from "./AppGateway";
import AutoScaling from "./AutoScaling";
import AzureCNI from "./AzureCNI";
import Calico from "./Calico";
import ContainerRegistry from "./ContainerRegistry";
import CustomVnet from "./CustomVnet";
import JumpServer from "./JumpServer";
import KubernetesVersion from "./KubernetesVersion";
import PrivateCluster from "./PrivateCluster";
import UserDefinedRouting from "./UserDefinedRouting";

export default function Tfvar() {
  const [versionMenu, setVersionMenu] = useState<boolean>(false);

  const { mutate: setLogs } = useSetLogs();
  const { data: lab } = useLab();
  const { mutate: deleteLab } = useDeleteLab();

  const [_lab, _setLab] = useState<Lab | undefined>(lab);

  return (
    <div onClick={() => setVersionMenu(false)}>
      <div className="flex flex-wrap gap-y-2 gap-x-2">
        <KubernetesVersion
          versionMenu={versionMenu}
          setVersionMenu={setVersionMenu}
        />
        <CodeEditor variant="secondary-outline">Extend Script</CodeEditor>
        <CustomVnet />
        <PrivateCluster />
        <JumpServer />
        <AzureCNI />
        <Calico />
        <AutoScaling />
        <UserDefinedRouting />
        <ContainerRegistry />
        <AppGateway />
      </div>
      <div className="mt-4 flex gap-x-2">
        <PlanButton variant="success" lab={lab}>
          Plan
        </PlanButton>
        <ApplyButton variant="primary" lab={lab}>
          Deploy
        </ApplyButton>
        <DestroyButton variant="danger" lab={lab}>
          Destroy
        </DestroyButton>
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
