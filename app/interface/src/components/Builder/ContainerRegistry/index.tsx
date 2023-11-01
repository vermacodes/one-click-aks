import { useContext } from "react";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import { defaultContainerRegistry } from "../../../defaults";
import { WebSocketContext } from "../../../WebSocketContext";

export default function ContainerRegistry() {
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
        if (lab.template.containerRegistries.length > 0) {
          lab.template.containerRegistries = [];
        } else {
          lab.template.containerRegistries = [defaultContainerRegistry];
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
        id="toggle-acr"
        label="ACR"
        disabled={true}
        checked={false}
        handleOnChange={handleOnChange}
      />
    );
  }

  var checked: boolean = true;
  if (
    lab &&
    lab.template &&
    lab.template.containerRegistries !== null &&
    lab.template.containerRegistries.length === 0
  ) {
    checked = false;
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-acr"
          label="ACR"
          checked={checked}
          disabled={labIsLoading || labIsFetching}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
