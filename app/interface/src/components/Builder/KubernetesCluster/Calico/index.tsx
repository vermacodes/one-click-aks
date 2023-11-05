import { useContext } from "react";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function Calico({ index }: Props) {
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
        if ("calico" === lab.template.kubernetesClusters[index].networkPolicy) {
          lab.template.kubernetesClusters[index].networkPolicy = "azure";
        } else {
          lab.template.kubernetesClusters[index].networkPolicy = "calico";
          lab.template.kubernetesClusters[index].networkPluginMode = "null";
        }
        !actionStatus.inProgress &&
          setLogs({
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
            "calico" === lab.template.kubernetesClusters[index].networkPolicy
          }
          disabled={
            lab.template.kubernetesClusters.length === 0 ||
            lab.template.kubernetesClusters[index].networkPlugin ===
              "kubenet" ||
            labIsLoading ||
            labIsFetching
          }
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
