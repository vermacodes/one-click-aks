import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";

export default function AutoScaling() {
  const { data: tfvar, isLoading } = useTfvar();
  const { mutate: setTfvar } = useSetTfvar();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (lab.template.kubernetesCluster.defaultNodePool.enableAutoScaling) {
          lab.template.kubernetesCluster.defaultNodePool.enableAutoScaling =
            false;
        } else {
          lab.template.kubernetesCluster.defaultNodePool.enableAutoScaling =
            true;
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

  if (lab && lab.template === undefined) {
    return <></>;
  }

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-autoscaling"
          label="Auto Scaling"
          disabled={false}
          checked={
            lab.template.kubernetesCluster.defaultNodePool.enableAutoScaling
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
