import { useContext } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function AutoScaling({ index }: Props) {
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();

  function handleOnChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (
          lab.template.kubernetesClusters[index].defaultNodePool
            .enableAutoScaling
        ) {
          lab.template.kubernetesClusters[
            index
          ].defaultNodePool.enableAutoScaling = false;
        } else {
          lab.template.kubernetesClusters[
            index
          ].defaultNodePool.enableAutoScaling = true;
        }
        !actionStatus.inProgress &&
          setLogs({
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
            lab.template.kubernetesClusters[index].defaultNodePool
              .enableAutoScaling
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
