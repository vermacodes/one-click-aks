import { useContext } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import { useSetLogs } from "../../../../../hooks/useLogs";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function VirtualNode({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
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
        if (lab.template.kubernetesClusters[index].addons.virtualNode) {
          console.log("Virtual Node is true");
          lab.template.kubernetesClusters[index].addons.virtualNode = false;
        } else {
          console.log("Virtual Node is false");
          lab.template.kubernetesClusters[index].addons.virtualNode = true;
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

  // If still loading then display disabled flag.
  if (labIsLoading || labIsFetching) {
    return (
      <Checkbox
        id="toggle-virtual-node"
        label="VirtualNode"
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
      lab.template.kubernetesClusters[index].addons &&
      lab.template.kubernetesClusters[index].addons.virtualNode === false) ||
    (lab.template.kubernetesClusters.length > 0 &&
      lab.template.kubernetesClusters[index].networkPlugin !== "azure")
  ) {
    checked = false;
  }

  // Disabled Conditions
  var disabled: boolean = false;
  if (
    labIsLoading ||
    labIsFetching ||
    lab.template.kubernetesClusters.length === 0 ||
    lab.template.kubernetesClusters[index].networkPlugin !== "azure" ||
    lab.template.virtualNetworks.length === 0
  ) {
    disabled = true;
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-virtual-node"
          label="VirtualNode"
          checked={checked}
          disabled={disabled}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
