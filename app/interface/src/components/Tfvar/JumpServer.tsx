import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";
import { defaultTfvarConfig } from "./defaults";

export default function JumpServer() {
  const { data: tfvar, isLoading } = useTfvar();
  const { mutate: setTfvar } = useSetTfvar();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (tfvar !== undefined) {
      if (tfvar.jumpservers.length === 0) {
        tfvar.jumpservers = defaultTfvarConfig.jumpservers;
      } else {
        tfvar.jumpservers = [];
      }
      !inProgress &&
        setLogs({ isStreaming: false, logs: JSON.stringify(tfvar, null, 4) });
      setTfvar(tfvar);
    }
  }

  //const disabled = tfvar.kubernetesCluster.privateClusterEnabled === "false";

  if (tfvar === undefined) {
    return <></>;
  }

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      {tfvar && (
        <Checkbox
          id="toggle-jumpserver"
          label="Jump Server"
          checked={tfvar.jumpservers.length > 0}
          disabled={tfvar.kubernetesCluster.privateClusterEnabled === "false"}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
