import { useState } from "react";
import { FaRedo } from "react-icons/fa";
import { Lab } from "../../../dataStructures";
import { useDeleteLab, useLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import CodeEditor from "../../../modals/CodeEditorModal";
import LabBuilder from "../../../modals/SaveLabModal";
import Button from "../../UserInterfaceComponents/Button";
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

export default function Builder() {
  const [versionMenu, setVersionMenu] = useState<boolean>(false);

  const { mutate: setLogs } = useSetLogs();
  const { data: lab } = useLab();
  const { mutate: deleteLab } = useDeleteLab();

  const [_lab, _setLab] = useState<Lab | undefined>(lab);

  return (
    <div
      onClick={() => setVersionMenu(false)}
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
        <LabBuilder variant="secondary-text">Save</LabBuilder>
        <Button
          variant="secondary-text"
          onClick={() => {
            setLogs({ logs: "" });
            deleteLab();
          }}
        >
          <span>
            <FaRedo />
          </span>
          Reset
        </Button>
        <ExportLabInBuilder variant="secondary-text">
          Download
        </ExportLabInBuilder>
        <ImportLabToBuilder />
      </div>
    </div>
  );
}
