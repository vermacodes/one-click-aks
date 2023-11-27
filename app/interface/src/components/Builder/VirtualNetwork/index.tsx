import { useContext } from "react";
import { getDefaultTfvarConfig } from "../../../defaults";
import { useSetLogs } from "../../../hooks/useLogs";
import { useGlobalStateContext } from "../../Context/GlobalStateContext";
import { WebSocketContext } from "../../Context/WebSocketContext";
import Checkbox from "../../UserInterfaceComponents/Checkbox";

export default function VirtualNetwork() {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { lab, setLab } = useGlobalStateContext();

  // Function to handle changes in the checkbox
  const handleOnChange = () => {
    const newLab = structuredClone(lab);
    if (newLab?.template) {
      // Toggle the virtual networks
      const deepCopy = getDefaultTfvarConfig();
      if (newLab.template.virtualNetworks.length === 0) {
        newLab.template.virtualNetworks = deepCopy.virtualNetworks;
        newLab.template.subnets = deepCopy.subnets;
        newLab.template.networkSecurityGroups = deepCopy.networkSecurityGroups;
      } else {
        newLab.template.virtualNetworks = [];
        newLab.template.subnets = [];
        newLab.template.networkSecurityGroups = [];
        newLab.template.jumpservers = [];
        newLab.template.firewalls = [];
        newLab.template.kubernetesClusters.forEach((cluster) => {
          cluster.addons.appGateway = false;
          cluster.addons.virtualNode = false;
          cluster.privateClusterEnabled = "false";
          cluster.outboundType = "loadBalancer";
        });
      }

      // Log the changes if not in progress
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(newLab.template, null, 4) });

      // Update the newLab
      setLab(newLab);
    }
  };

  // Define the disabled state
  const disabled = false;

  // Define the checked state
  const checked = (lab?.template?.virtualNetworks?.length ?? 0) > 0;

  return lab?.template ? (
    <Checkbox
      id="toggle-custom-vnet"
      label="Virtual Network"
      checked={checked}
      disabled={disabled}
      handleOnChange={handleOnChange}
    />
  ) : null;
}
