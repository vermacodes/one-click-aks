import { useContext } from "react";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../Checkbox";
import { WebSocketContext } from "../../WebSocketContext";

export default function AutoScaling() {
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();
  const { data: inProgress } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (
          lab.template.kubernetesClusters[0].defaultNodePool.enableAutoScaling
        ) {
          lab.template.kubernetesClusters[0].defaultNodePool.enableAutoScaling =
            false;
        } else {
          lab.template.kubernetesClusters[0].defaultNodePool.enableAutoScaling =
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

  if (labIsLoading || labIsFetching) {
    return (
      <Checkbox
        id="toggle-autoscaling"
        label="Auto Scaling"
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
          id="toggle-autoscaling"
          label="Auto Scaling"
          disabled={
            labIsLoading ||
            labIsFetching ||
            lab.template.kubernetesClusters.length === 0
          }
          checked={
            lab.template.kubernetesClusters.length > 0 &&
            lab.template.kubernetesClusters[0].defaultNodePool.enableAutoScaling
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
