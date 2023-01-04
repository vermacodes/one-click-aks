import React from "react";
import { useActionStatus } from "../../../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../Checkbox";

type Props = {};

export default function NetworkPluginMode({}: Props) {
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
        if ("null" === lab.template.kubernetesCluster.networkPluginMode) {
          lab.template.kubernetesCluster.networkPluginMode = "Overlay";
        } else {
          lab.template.kubernetesCluster.networkPluginMode = "null";
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
        id="toggle-overlay"
        label="Overlay"
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
          id="toggle-overlay"
          label="Overlay"
          checked={
            "Overlay" === lab.template.kubernetesCluster.networkPluginMode
          }
          disabled={
            labIsLoading ||
            labIsFetching ||
            "azure" !== lab.template.kubernetesCluster.networkPlugin
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
