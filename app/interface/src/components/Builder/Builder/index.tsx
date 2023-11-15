import { useState } from "react";
import { Lab } from "../../../dataStructures";
import { useLab } from "../../../hooks/useLab";
import CodeEditor from "../../../modals/CodeEditorModal";
import ExportLabInBuilder from "../../Lab/Export/ExportLabInBuilder";
import ImportLabToBuilder from "../../Lab/Import/ImportLabToBuilder";
import ApplyButton from "../../Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../Terraform/ActionButtons/DestroyButton";
import PlanButton from "../../Terraform/ActionButtons/PlanButton";
import AzureFirewall from "../AzureFirewall";
import ContainerRegistry from "../ContainerRegistry";
import VirtualNetwork from "../VirtualNetwork";
import KubernetesCluster from "../KubernetesCluster/KubernetesCluster";
import AddKubernetesCluster from "../KubernetesCluster/AddKubernetesCluster";
import Tooltip from "../../UserInterfaceComponents/Tooltip";
import ResetLabState from "../../Lab/ResetLabState";
import SaveLabButton from "../../Lab/SaveLab/SaveLabButton";

export default function Builder() {
  const { data: lab } = useLab();

  const [_lab, _setLab] = useState<Lab | undefined>(lab);

  return (
    <div
      className={`rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div className="flex flex-wrap gap-y-2 gap-x-2">
        <VirtualNetwork />
        <ContainerRegistry />
        <AzureFirewall />
        <AddKubernetesCluster />
        <KubernetesCluster />
      </div>
      <div className={`mt-12 flex flex-wrap gap-2`}>
        <PlanButton variant="success-text" lab={lab}>
          Plan
        </PlanButton>
        <ApplyButton variant="primary-text" lab={lab}>
          Deploy
        </ApplyButton>
        <DestroyButton variant="danger-text" lab={lab}>
          Destroy
        </DestroyButton>
        <Tooltip message="Update extension script" delay={500}>
          <CodeEditor variant="secondary-text">Extension</CodeEditor>
        </Tooltip>
        {/* <LabBuilder variant="secondary-text">Save</LabBuilder> */}
        <SaveLabButton />
        <ResetLabState />
        <ExportLabInBuilder variant="secondary-text">
          Download
        </ExportLabInBuilder>
        <ImportLabToBuilder />
      </div>
    </div>
  );
}
