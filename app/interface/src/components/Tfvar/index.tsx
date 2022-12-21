import { useState } from "react";
import { useQueryClient } from "react-query";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
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
  const [versionMenu, setVersionMenu] = useState<boolean>(false);

  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const { data: lab } = useLab();
  const queryClient = useQueryClient();

  function applyHandler() {
    // TODO: Is this the best way to do this? If not, fix.
    queryClient.setQueryData("get-action-status", { inProgress: true });
    setTimeout(() => {
      queryClient.invalidateQueries("get-action-status");
    }, 50);

    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("apply", lab);
  }

  function planHandler() {
    queryClient.setQueryData("get-action-status", { inProgress: true });
    setTimeout(() => {
      queryClient.invalidateQueries("get-action-status");
    }, 50);

    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("plan", lab);
  }

  function destroyHandler() {
    queryClient.setQueryData("get-action-status", { inProgress: true });
    setTimeout(() => {
      queryClient.invalidateQueries("get-action-status");
    }, 50);

    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("destroy", lab);
  }

  return (
    <div onClick={() => setVersionMenu(false)}>
      <div className="flex flex-wrap gap-x-2 gap-y-2">
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
