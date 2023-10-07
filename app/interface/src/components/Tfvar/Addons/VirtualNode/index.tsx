import { useActionStatus } from "../../../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../Checkbox";

type Props = {};

export default function VirtualNode({}: Props) {
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
        if (lab.template.kubernetesClusters[0].addons.virtualNode) {
          console.log("Virtual Node is true");
          lab.template.kubernetesClusters[0].addons.virtualNode = false;
        } else {
          console.log("Virtual Node is false");
          lab.template.kubernetesClusters[0].addons.virtualNode = true;
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

  // If still loading then display disabled flag.
  if (labIsLoading || labIsFetching) {
    return (
      <Checkbox
        id="toggle-virtual-node"
        label="VirtualNode (Addon)"
        disabled={true}
        checked={false}
        handleOnChange={handleOnChange}
      />
    );
  }

  // Checked conditions
  var checked: boolean = true;
  if (
    (lab &&
      lab.template &&
      lab.template.kubernetesClusters.length > 0 &&
      lab.template.kubernetesClusters[0].addons &&
      lab.template.kubernetesClusters[0].addons.virtualNode === false) ||
    (lab.template.kubernetesClusters.length > 0 &&
      lab.template.kubernetesClusters[0].networkPlugin !== "azure")
  ) {
    checked = false;
  }

  // Disabled Conditions
  var disabled: boolean = false;
  if (
    labIsLoading ||
    labIsFetching ||
    lab.template.kubernetesClusters.length === 0 ||
    lab.template.kubernetesClusters[0].networkPlugin !== "azure" ||
    lab.template.virtualNetworks.length === 0
  ) {
    disabled = true;
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-virtual-node"
          label="VirtualNode (Addon)"
          checked={checked}
          disabled={disabled}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
