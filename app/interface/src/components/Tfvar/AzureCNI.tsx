import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";

export default function AzureCNI() {
  const { data: tfvar, isLoading } = useTfvar();
  const { mutate: setTfvar } = useSetTfvar();
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
        if ("azure" === lab.template.kubernetesCluster.networkPlugin) {
          lab.template.kubernetesCluster.networkPlugin = "kubenet";
          lab.template.kubernetesCluster.networkPolicy = "null";
        } else {
          lab.template.kubernetesCluster.networkPlugin = "azure";
          lab.template.kubernetesCluster.networkPolicy = "azure";
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

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-azurecni"
          label="Azure CNI"
          checked={"azure" === lab.template.kubernetesCluster.networkPlugin}
          disabled={false}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
