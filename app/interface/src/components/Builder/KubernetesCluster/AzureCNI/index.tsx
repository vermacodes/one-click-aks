import { useContext } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function AzureCNI({ index }: Props) {
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
        if ("azure" === lab.template.kubernetesClusters[index].networkPlugin) {
          lab.template.kubernetesClusters[index].networkPlugin = "kubenet";
          lab.template.kubernetesClusters[index].networkPolicy = "null";
          lab.template.kubernetesClusters[index].networkPluginMode = "null";
          lab.template.kubernetesClusters[index].addons.virtualNode = false;
        } else {
          lab.template.kubernetesClusters[index].networkPlugin = "azure";
          lab.template.kubernetesClusters[index].networkPolicy = "azure";
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
        id="toggle-azurecni"
        label="Azure CNI"
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
          id="toggle-azurecni"
          label="Azure CNI"
          checked={
            lab.template.kubernetesClusters.length > 0 &&
            "azure" === lab.template.kubernetesClusters[index].networkPlugin
          }
          disabled={
            labIsLoading ||
            labIsFetching ||
            lab.template.kubernetesClusters.length === 0
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
