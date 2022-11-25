import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";
import { defaultTfvarConfig } from "./defaults";

export default function CustomVnet() {
  const { data: tfvar, isLoading } = useTfvar();
  const { mutate: setTfvar } = useSetTfvar();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (tfvar.virtualNetworks.length === 0) {
      tfvar.virtualNetworks = defaultTfvarConfig.virtualNetworks;
      tfvar.subnets = defaultTfvarConfig.subnets;
    } else {
      tfvar.virtualNetworks = [];
      tfvar.subnets = [];
      tfvar.jumpservers = [];
      tfvar.firewalls = [];
      tfvar.kubernetesCluster.privateClusterEnabled = "false";
      tfvar.kubernetesCluster.outboundType = "loadBalancer";
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

  return (
    <>
      {tfvar && (
        <Checkbox
          id="toggle-customvnet"
          label="Custom VNET"
          checked={tfvar.virtualNetworks.length > 0}
          disabled={false}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
