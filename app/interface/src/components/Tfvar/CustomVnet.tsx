import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../Checkbox";
import { defaultTfvarConfig } from "./defaults";

export default function CustomVnet() {
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (lab.template.virtualNetworks.length === 0) {
          lab.template.virtualNetworks = defaultTfvarConfig.virtualNetworks;
          lab.template.subnets = defaultTfvarConfig.subnets;
          lab.template.networkSecurityGroups =
            defaultTfvarConfig.networkSecurityGroups;
        } else {
          lab.template.virtualNetworks = [];
          lab.template.subnets = [];
          lab.template.networkSecurityGroups = [];
          lab.template.jumpservers = [];
          lab.template.firewalls = [];
          if (lab.template.kubernetesClusters.length > 0) {
            lab.template.kubernetesClusters[0].addons.appGateway = false;
            lab.template.kubernetesClusters[0].privateClusterEnabled = "false";
            lab.template.kubernetesClusters[0].outboundType = "loadBalancer";
          }
        }
        !inProgress &&
          setLogs({
            isStreaming: false,
            logs: JSON.stringify(lab.template, null, 4),
          });
        setLab(lab);
      }
    }
  }

  if (lab === undefined || lab.template === undefined) {
    return <></>;
  }

  if (labIsLoading || labIsFetching) {
    return (
      <Checkbox
        id="toggle-customvnet"
        label="Custom VNET"
        disabled={true}
        checked={false}
        handleOnChange={handleOnChange}
      />
    );
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-customvnet"
          label="Custom VNET"
          checked={lab.template.virtualNetworks.length > 0}
          disabled={labIsLoading || labIsFetching}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
