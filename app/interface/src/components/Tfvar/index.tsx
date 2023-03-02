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
      </div>
      <div className={`mt-12 flex flex-wrap gap-2`}>
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
        <button
          className={`flex items-center gap-3 rounded py-1 px-3 text-lg hover:bg-sky-500 hover:bg-opacity-20`}
          onClick={() => {
            setLogs({ isStreaming: false, logs: "" });
            deleteLab();
          }}
        >
          <span>
            <FaRedo />
          </span>
          Reset
        </button>
        <ExportLabInBuilder variant="secondary">Downlaod</ExportLabInBuilder>
        <ImportLabToBuilder />
      </div>
    </div>
  );
}
