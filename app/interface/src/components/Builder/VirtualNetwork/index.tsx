import { useContext } from "react";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import { defaultTfvarConfig } from "../../../defaults";
import { WebSocketContext } from "../../../WebSocketContext";

export default function VirtualNetwork() {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { data: lab, isLoading, isFetching } = useLab();
  const { mutate: setLab } = useSetLab();

  // Function to handle changes in the checkbox
  const handleOnChange = () => {
    if (lab?.template) {
      // Toggle the virtual networks
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
        lab.template.kubernetesClusters.forEach((cluster) => {
          cluster.addons.appGateway = false;
          cluster.addons.virtualNode = false;
          cluster.privateClusterEnabled = "false";
          cluster.outboundType = "loadBalancer";
        });
      }

      // Log the changes if not in progress
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab.template, null, 4) });

      // Update the lab
      setLab(lab);
    }
  };

  // Define the disabled state
  const disabled = isLoading || isFetching;

  // Define the checked state
  const checked = (lab?.template?.jumpservers?.length ?? 0) > 0;

  return lab?.template ? (
    <Checkbox
      id="toggle-custom-vnet"
      label="VNET"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  ) : null;
}
