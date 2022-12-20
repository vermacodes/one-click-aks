import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";

export default function Calico() {
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
        if ("calico" === lab.template.kubernetesCluster.networkPolicy) {
          lab.template.kubernetesCluster.networkPolicy = "azure";
        } else {
          lab.template.kubernetesCluster.networkPolicy = "calico";
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
      {lab && lab.template && lab.template.kubernetesCluster && (
        <Checkbox
          id="toggle-calico"
          label="Calico"
          checked={"calico" === lab.template.kubernetesCluster.networkPolicy}
          disabled={lab.template.kubernetesCluster.networkPlugin === "kubenet"}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
