import { useState } from "react";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useTfvar } from "../../hooks/useTfvar";
import LabBuilder from "../../modals/LabBuilder";
import { axiosInstance } from "../../utils/axios-interceptors";
import Button from "../Button";
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
  const [showLabBuilder, setShowLabBuilder] = useState(false);
  const [versionMenu, setVersionMenu] = useState<boolean>(false);

  const { data: inProgress } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const { data: tfvar } = useTfvar();

  function applyHandler() {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("apply", tfvar);
  }

  function planHandler() {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("plan", tfvar);
  }

  function destroyHandler() {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("destroy", tfvar);
  }

  function handleCreateLab() {
    setShowLabBuilder(true);
  }

  return (
    <div onClick={() => setVersionMenu(false)}>
      <div className="flex gap-x-2">
        <KubernetesVersion
          versionMenu={versionMenu}
          setVersionMenu={setVersionMenu}
        />
        <CustomVnet />
        <PrivateCluster />
        <JumpServer />
        <AzureCNI />
        <Calico />
        <AutoScaling />
        <UserDefinedRouting />
        <ContainerRegistry />
      </div>
      <div className="mt-4 flex gap-x-2">
        <Button variant="success" onClick={planHandler} disabled={inProgress}>
          Plan
        </Button>
        <Button variant="primary" onClick={applyHandler} disabled={inProgress}>
          Apply
        </Button>
        <Button variant="danger" onClick={destroyHandler} disabled={inProgress}>
          Destroy
        </Button>
        <LabBuilder variant="secondary">Save</LabBuilder>
        <Button
          variant="secondary"
          onClick={() => setLogs({ isStreaming: false, logs: "" })}
          disabled={inProgress}
        >
          Clear Logs
        </Button>
      </div>
    </div>
  );
}
