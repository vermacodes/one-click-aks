import { useContext } from "react";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import { defaultTfvarConfig } from "../../../defaults";
import { WebSocketContext } from "../../../WebSocketContext";

export default function VirtualMachine() {
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
        if (lab.template.jumpservers.length === 0) {
          lab.template.jumpservers = defaultTfvarConfig.jumpservers;
        } else {
          lab.template.jumpservers = [];
        }
        !actionStatus.inProgress &&
          setLogs({
            logs: JSON.stringify(lab.template, null, 4),
          });
        setLab(lab);
      }
    }
  }

  //const disabled = lab.template.kubernetesCluster.privateClusterEnabled === "false";

  if (lab === undefined || lab.template === undefined) {
    return <></>;
  }

  if (labIsLoading || labIsFetching) {
    return (
      <Checkbox
        id="toggle-jumpserver"
        label="Jump Server"
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
          id="toggle-jumpserver"
          label="Jump Server"
          checked={lab.template.jumpservers.length > 0}
          disabled={
            lab.template.kubernetesClusters.length === 0 ||
            lab.template.kubernetesClusters[0].privateClusterEnabled ===
              "false" ||
            labIsLoading ||
            labIsFetching
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
