import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";
import { defaultFirewall } from "./defaults";

export default function UserDefinedRouting() {
  const { data: tfvar, isLoading } = useTfvar();
  const { mutate: setTfvar } = useSetTfvar();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (tfvar.firewalls.length > 0) {
      tfvar.kubernetesCluster.outboundType = "loadBalancer";
      tfvar.firewalls = [];
    } else {
      tfvar.kubernetesCluster.outboundType = "userDefinedRouting";
      tfvar.firewalls = [defaultFirewall];
    }
    !inProgress &&
      setLogs({ isStreaming: false, logs: JSON.stringify(tfvar, null, 4) });
    setTfvar(tfvar);
  }

  if (tfvar === undefined) {
    return <></>;
  }

  if (isLoading) {
    return <>Loading...</>;
  }

  var checked: boolean = true;
  if (tfvar && tfvar.firewalls.length === 0) {
    checked = false;
  }

  var disabled: boolean = false;
  if (tfvar && tfvar.virtualNetworks.length === 0) {
    disabled = true;
  }

  return (
    <>
      {tfvar && (
        <Checkbox
          id="toggle-udr"
          label="UDR"
          checked={checked}
          disabled={disabled}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
