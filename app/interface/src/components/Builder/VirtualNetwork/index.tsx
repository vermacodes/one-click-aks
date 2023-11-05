import { useContext } from "react";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import { defaultTfvarConfig } from "../../../defaults";
import { WebSocketContext } from "../../../WebSocketContext";

export default function virtualNetwork() {
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();
  const { actionStatus } = useContext(WebSocketContext);
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
            lab.template.kubernetesClusters.forEach((cluster, index) => {
              cluster.addons.appGateway = false;
              cluster.addons.virtualNode = false;
              cluster.privateClusterEnabled = "false";
              cluster.outboundType = "loadBalancer";
            });
          }
        }
        !actionStatus.inProgress &&
          setLogs({
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
        id="toggle-custom-vnet"
        label="VNET"
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
          id="toggle-custom-vnet"
          label="VNET"
          checked={lab.template.virtualNetworks.length > 0}
          disabled={labIsLoading || labIsFetching}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
