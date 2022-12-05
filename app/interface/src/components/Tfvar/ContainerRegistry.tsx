import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";
import { defaultContainerRegistry } from "./defaults";

export default function ContainerRegistry() {
  const { data: tfvar, isLoading } = useTfvar();
  const { mutate: setTfvar } = useSetTfvar();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (tfvar !== undefined) {
      if (tfvar.containerRegistries.length > 0) {
        tfvar.kubernetesCluster.outboundType = "loadBalancer";
        tfvar.containerRegistries = [];
      } else {
        tfvar.kubernetesCluster.outboundType = "userDefinedRouting";
        tfvar.containerRegistries = [defaultContainerRegistry];
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

  var checked: boolean = true;
  if (tfvar && tfvar.containerRegistries.length === 0) {
    checked = false;
  }

  return (
    <>
      {tfvar && (
        <Checkbox
          id="toggle-acr"
          label="ACR"
          checked={checked}
          disabled={false}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
