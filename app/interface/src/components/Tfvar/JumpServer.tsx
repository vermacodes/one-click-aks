import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../Checkbox";
import { defaultTfvarConfig } from "./defaults";

export default function JumpServer() {
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
        if (lab.template.jumpservers.length === 0) {
          lab.template.jumpservers = defaultTfvarConfig.jumpservers;
        } else {
          lab.template.jumpservers = [];
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
            lab.template.kubernetesCluster.privateClusterEnabled === "false" ||
            labIsLoading ||
            labIsFetching
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
