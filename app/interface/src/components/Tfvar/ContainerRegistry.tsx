import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";
import { defaultContainerRegistry } from "./defaults";

export default function ContainerRegistry() {
  const { data: tfvar, isLoading } = useTfvar();
  const { mutate: setTfvar } = useSetTfvar();
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
        if (lab.template.containerRegistries.length > 0) {
          lab.template.containerRegistries = [];
        } else {
          lab.template.containerRegistries = [defaultContainerRegistry];
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

  if (isLoading) {
    return <>Loading...</>;
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
          disabled={false}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
