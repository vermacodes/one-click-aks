import Checkbox from "../../UserInterfaceComponents/Checkbox";

export default function ResourceGroup() {
  return (
    <Checkbox
      label="Resource Group"
      id="toggle-resource-group"
      disabled={false}
      checked={true}
      handleOnChange={() => {}}
      tooltipMessage="Resource Group is required."
      tooltipDelay={1000}
    />
  );
}
