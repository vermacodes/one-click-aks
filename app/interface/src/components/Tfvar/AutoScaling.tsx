import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../Checkbox";

export default function AutoScaling() {
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

  // if (labIsLoading || labIsFetching) {
  //   return <>Loading...</>;
  // }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-autoscaling"
          label="Auto Scaling"
          disabled={labIsLoading || labIsFetching}
          checked={
            lab.template.kubernetesCluster.defaultNodePool.enableAutoScaling
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
