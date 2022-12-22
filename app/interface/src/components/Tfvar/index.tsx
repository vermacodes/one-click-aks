import { useState } from "react";
import { Lab } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import {
  useApply,
  useDestroy,
  useExtend,
  usePlan,
} from "../../hooks/useTerraform";
import CodeEditor from "../../modals/CodeEditor";
import LabBuilder from "../../modals/LabBuilder";
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
  const { mutate: plan } = usePlan();
  const { mutateAsync: applyAsync } = useApply();
  const { mutate: destroy } = useDestroy();
  const { mutate: extend } = useExtend();

  const [_lab, _setLab] = useState<Lab | undefined>(lab);

  // function applyHandler() {
  //   setLogs({ isStreaming: true, logs: "" });
  //   lab && apply(lab);
  // }

  function applyHandler() {
    if (lab !== undefined) {
      setLogs({ isStreaming: true, logs: "" });
      applyAsync(lab).then(() => {
        extend(lab);
      });
    }
  }

  function planHandler() {
    setLogs({ isStreaming: true, logs: "" });
    lab && plan(lab);
  }

  function destroyHandler() {
    setLogs({ isStreaming: true, logs: "" });
    lab && destroy(lab);
  }

  return (
    <div onClick={() => setVersionMenu(false)}>
      <div className="flex flex-wrap gap-x-2 gap-y-2">
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
