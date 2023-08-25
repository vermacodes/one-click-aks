import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../Checkbox";

export default function AzureCNI() {
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
        if ("azure" === lab.template.kubernetesClusters[0].networkPlugin) {
          lab.template.kubernetesClusters[0].networkPlugin = "kubenet";
          lab.template.kubernetesClusters[0].networkPolicy = "null";
          lab.template.kubernetesClusters[0].networkPluginMode = "null";
          lab.template.kubernetesClusters[0].addons.virtualNode = false;
        } else {
          lab.template.kubernetesClusters[0].networkPlugin = "azure";
          lab.template.kubernetesClusters[0].networkPolicy = "azure";
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
            "azure" === lab.template.kubernetesClusters[0].networkPlugin
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
