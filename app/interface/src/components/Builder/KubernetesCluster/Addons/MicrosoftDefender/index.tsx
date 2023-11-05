import { useContext } from "react";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import { useSetLogs } from "../../../../../hooks/useLogs";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { WebSocketContext } from "../../../../../WebSocketContext";

type Props = {
  index: number;
};

export default function MicrosoftDefender({ index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  // Function to handle changes to the Microsoft Defender addon
  function handleOnChange() {
    if (lab === undefined) {
      return;
    }
    // Get a reference to the addons object
    const addons = lab?.template?.kubernetesClusters[index]?.addons;

    if (addons?.microsoftDefender === undefined) {
      return;
    }

    // Toggle the Microsoft Defender addon
    addons.microsoftDefender = !addons.microsoftDefender;

    // Update the logs if no action is in progress
    !actionStatus.inProgress &&
      setLogs({
        logs: JSON.stringify(lab.template, null, 4),
      });

    // Update the lab state
    setLab(lab);
  }

  // If the lab or template is undefined, return an empty fragment
  if (lab === undefined || lab.template === undefined) {
    return <></>;
  }

  // Determine the checked and disabled states
  const checked =
    lab?.template?.kubernetesClusters[index]?.addons?.microsoftDefender ??
    false;
  const disabled =
    labIsLoading ||
    labIsFetching ||
    lab.template.kubernetesClusters.length === 0;

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-defender"
          label="Microsoft Defender"
          checked={checked}
          disabled={disabled}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
