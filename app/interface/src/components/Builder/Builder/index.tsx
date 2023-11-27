import { useState } from "react";
import { Lab } from "../../../dataStructures";
import { useLab } from "../../../hooks/useLab";
import CodeEditor from "../../../modals/CodeEditorModal";
import ExportLabInBuilder from "../../Lab/Export/ExportLabInBuilder";
import ImportLabToBuilder from "../../Lab/Import/ImportLabToBuilder";
import ResetLabState from "../../Lab/ResetLabState";
import SaveLabButton from "../../Lab/SaveLab/SaveLabButton";
import ApplyButton from "../../Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../Terraform/ActionButtons/DestroyButton";
import PlanButton from "../../Terraform/ActionButtons/PlanButton";
import Container from "../../UserInterfaceComponents/Container";
import Tooltip from "../../UserInterfaceComponents/Tooltip";
import AzureFirewall from "../AzureFirewall";
import ContainerRegistry from "../ContainerRegistry";
import AddKubernetesCluster from "../KubernetesCluster/AddKubernetesCluster";
import KubernetesCluster from "../KubernetesCluster/KubernetesCluster";
import ResourceGroup from "../ResourceGroup";
import VirtualMachine from "../VirtualMachine";
import VirtualNetwork from "../VirtualNetwork";

export default function Builder() {
  const { data: lab } = useLab();

  const [_lab, _setLab] = useState<Lab | undefined>(lab);

  return (
    <Container
      title="Builder"
      additionalClasses="flex flex-col gap-4"
      collapsible={true}
      //className={`rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div className="flex flex-wrap gap-4">
        <ResourceGroup />
        <VirtualNetwork />
        <ContainerRegistry />
        <AzureFirewall />
        <AddKubernetesCluster />
        <KubernetesCluster />
        <VirtualMachine />
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
    </Container>
  );
}
