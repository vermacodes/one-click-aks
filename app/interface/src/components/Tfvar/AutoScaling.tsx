import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";

export default function AutoScaling() {
  const { data: tfvar, isLoading } = useTfvar();
  const { mutate: setTfvar } = useSetTfvar();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (tfvar !== undefined) {
      if (tfvar.kubernetesCluster.defaultNodePool.enableAutoScaling) {
        tfvar.kubernetesCluster.defaultNodePool.enableAutoScaling = false;
      } else {
        tfvar.kubernetesCluster.defaultNodePool.enableAutoScaling = true;
      }
      !inProgress &&
        setLogs({ isStreaming: false, logs: JSON.stringify(tfvar, null, 4) });
      setTfvar(tfvar);
    }
  }

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
          id="toggle-autoscaling"
          label="Auto Scaling"
          disabled={false}
          checked={tfvar.kubernetesCluster.defaultNodePool.enableAutoScaling}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
