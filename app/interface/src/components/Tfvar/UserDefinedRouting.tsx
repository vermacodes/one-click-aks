import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../Checkbox";
import { defaultFirewall } from "./defaults";

export default function UserDefinedRouting() {
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  function handleOnChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (lab.template.firewalls.length > 0) {
          lab.template.kubernetesCluster.outboundType = "loadBalancer";
          lab.template.firewalls = [];
        } else {
          lab.template.kubernetesCluster.outboundType = "userDefinedRouting";
          lab.template.firewalls = [defaultFirewall];
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

  if (labIsFetching || labIsLoading) {
    return <>Loading...</>;
  }

  var checked: boolean = true;
  if (lab && lab.template && lab.template.firewalls.length === 0) {
    checked = false;
  }

  var disabled: boolean = false;
  if (lab && lab.template && lab.template.virtualNetworks.length === 0) {
    disabled = true;
  }

  return (
    <>
      {lab && lab.template && (
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
