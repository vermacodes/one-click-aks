import { useContext, useState } from "react";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import { defaultFirewall } from "../../../defaults";
import { WebSocketContext } from "../../Context/WebSocketContext";

export default function AzureFirewall() {
  const [tooltipMessage, setTooltipMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  const noVirtualNetworksMessage = "Virtual Network Required.";

  function handleOnChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (lab.template.firewalls.length > 0) {
          lab.template.firewalls = [];
        } else {
          lab.template.firewalls = [defaultFirewall];
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
        id="toggle-azure-firewall"
        label="Firewall"
        disabled={true}
        checked={false}
        handleOnChange={handleOnChange}
      />
    );
  }

  var checked: boolean = true;
  if (lab && lab.template && lab.template.firewalls.length === 0) {
    checked = false;
  }

  var disabled: boolean = false;
  if (
    (lab && lab.template && lab.template.virtualNetworks.length === 0) ||
    labIsLoading ||
    labIsFetching
  ) {
    disabled = true;
  }

  if (
    lab?.template?.virtualNetworks.length === 0 &&
    tooltipMessage !== noVirtualNetworksMessage
  ) {
    setTooltipMessage(noVirtualNetworksMessage);
  }

  if (lab?.template?.virtualNetworks.length > 0 && tooltipMessage) {
    setTooltipMessage("");
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-azure-firewall"
          label="Firewall"
          checked={checked}
          disabled={disabled}
          tooltipMessage={tooltipMessage}
          tooltipDelay={200}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
