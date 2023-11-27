import { useContext } from "react";
import { getDefaultContainerRegistry } from "../../../defaults";
import { useSetLogs } from "../../../hooks/useLogs";
import { useGlobalStateContext } from "../../Context/GlobalStateContext";
import { WebSocketContext } from "../../Context/WebSocketContext";
import Checkbox from "../../UserInterfaceComponents/Checkbox";

export default function ContainerRegistry() {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { lab, setLab } = useGlobalStateContext();

  function handleOnChange() {
    const newLab = structuredClone(lab);
    if (newLab !== undefined) {
      if (newLab.template !== undefined) {
        if (newLab.template.containerRegistries.length > 0) {
          newLab.template.containerRegistries = [];
        } else {
          newLab.template.containerRegistries = [getDefaultContainerRegistry()];
        }
        !actionStatus.inProgress &&
          setLogs({
            logs: JSON.stringify(newLab.template, null, 4),
          });
        setLab(newLab);
      }
    }
  }

  if (lab === undefined || lab.template === undefined) {
    return <></>;
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
          label="Container Registry"
          checked={checked}
          disabled={false}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
