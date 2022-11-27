import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";

export default function Calico() {
  const { data: tfvar, isLoading } = useTfvar();
  const { mutate: setTfvar } = useSetTfvar();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (tfvar !== undefined) {
      if ("calico" === tfvar.kubernetesCluster.networkPolicy) {
        tfvar.kubernetesCluster.networkPolicy = "azure";
      } else {
        tfvar.kubernetesCluster.networkPolicy = "calico";
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
      {tfvar.kubernetesCluster && (
        <Checkbox
          id="toggle-calico"
          label="Calico"
          checked={"calico" === tfvar.kubernetesCluster.networkPolicy}
          disabled={tfvar.kubernetesCluster.networkPlugin === "kubenet"}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
