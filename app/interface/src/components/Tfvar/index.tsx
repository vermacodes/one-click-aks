import { useState } from "react";
import {
  FaArrowCircleLeft,
  FaBackward,
  FaReact,
  FaRedo,
  FaTimes,
} from "react-icons/fa";
import { Lab } from "../../dataStructures";
import { useDeleteLab, useLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import CodeEditor from "../../modals/CodeEditorModal";
import LabBuilder from "../../modals/SaveLabModal";
import Button from "../UserInterfaceComponents/Button";
import ExportLabInBuilder from "../Lab/Export/ExportLabInBuilder";
import ImportLabToBuilder from "../Lab/Import/ImportLabToBuilder";
import ApplyButton from "../Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../Terraform/ActionButtons/DestroyButton";
import PlanButton from "../Terraform/ActionButtons/PlanButton";
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
import VirtualNode from "./Addons/VirtualNode";
import HttpApplicationRouting from "./Addons/HttpApplicationRouting";

export default function Tfvar() {
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
        <VirtualNode />
        <HttpApplicationRouting />
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
        <CodeEditor variant="secondary-text">Extension</CodeEditor>
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
