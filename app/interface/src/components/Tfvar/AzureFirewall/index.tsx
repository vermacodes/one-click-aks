import { useActionStatus } from "../../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import Checkbox from "../../Checkbox";
import { defaultFirewall } from "./../defaults";

export default function AzureFirewall() {
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
          lab.template.firewalls = [];
        } else {
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

  if (labIsLoading || labIsFetching) {
    return (
      <Checkbox
        id="toggle-azurefirewall"
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

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-azurefirewall"
          label="Firewall"
          checked={checked}
          disabled={disabled}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
