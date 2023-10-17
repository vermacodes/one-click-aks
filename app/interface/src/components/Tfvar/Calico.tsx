import { useContext } from "react";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../Checkbox";
import { WebSocketContext } from "../../WebSocketContext";

export default function Calico() {
  const { data: inProgress } = useContext(WebSocketContext);
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
        if ("calico" === lab.template.kubernetesClusters[0].networkPolicy) {
          lab.template.kubernetesClusters[0].networkPolicy = "azure";
        } else {
          lab.template.kubernetesClusters[0].networkPolicy = "calico";
          lab.template.kubernetesClusters[0].networkPluginMode = "null";
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
        id="toggle-calico"
        label="Calico"
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
          id="toggle-calico"
          label="Calico"
          checked={
            lab.template.kubernetesClusters.length > 0 &&
            "calico" === lab.template.kubernetesClusters[0].networkPolicy
          }
          disabled={
            lab.template.kubernetesClusters.length === 0 ||
            lab.template.kubernetesClusters[0].networkPlugin === "kubenet" ||
            labIsLoading ||
            labIsFetching
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
