import React, { useContext } from "react";
import { useActionStatus } from "../../../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../Checkbox";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {};

export default function NetworkPluginMode({}: Props) {
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
        if ("null" === lab.template.kubernetesClusters[0].networkPluginMode) {
          lab.template.kubernetesClusters[0].networkPluginMode = "Overlay";
        } else {
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
            lab.template.kubernetesClusters.length > 0 &&
            "Overlay" === lab.template.kubernetesClusters[0].networkPluginMode
          }
          disabled={
            labIsLoading ||
            labIsFetching ||
            lab.template.kubernetesClusters.length === 0 ||
            "azure" !== lab.template.kubernetesClusters[0].networkPlugin ||
            "azure" !== lab.template.kubernetesClusters[0].networkPolicy
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
