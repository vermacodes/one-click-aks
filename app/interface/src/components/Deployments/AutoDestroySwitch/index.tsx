import { useState } from "react";
import { toast } from "react-toastify";
import { DeploymentType } from "../../../dataStructures";
import { usePatchDeployment } from "../../../hooks/useDeployments";
import { calculateNewEpochTimeForDeployment } from "../../../utils/helpers";
import Checkbox from "../../UserInterfaceComponents/Checkbox";

type AutoDestroySwitchProps = {
  disabled: boolean;
  deployment: DeploymentType;
  label: string;
};

export default function AutoDestroySwitch({
  disabled,
  deployment,
  label,
}: AutoDestroySwitchProps) {
  const { mutateAsync: asyncPatchDeployment } = usePatchDeployment();
  const [checked, setChecked] = useState(deployment.deploymentAutoDelete);

  function handleAutoDeleteChange() {
    //Switch the auto delete state
    setChecked(!checked);
    deployment.deploymentAutoDelete = !deployment.deploymentAutoDelete;
    var deploymentAutoDeleteUnixTime = 0;

    // if auto delete is enabled, then set the time to whatever it should be.
    if (deployment.deploymentAutoDelete) {
      deploymentAutoDeleteUnixTime =
        calculateNewEpochTimeForDeployment(deployment);
    }

    toast.promise(
      asyncPatchDeployment({
        ...deployment,
        deploymentAutoDeleteUnixTime: deploymentAutoDeleteUnixTime,
      }),
      {
        pending: "Updating deployment...",
        success: "Deployment updated.",
        error: {
          render(data: any) {
            return `Failed to update deployment. ${data.data.response.data.error}`;
          },
          autoClose: 5000,
        },
      },
      {
        toastId: "auto-destroy-switch",
      }
    );
  }

  return (
    <Checkbox
      id={"auto-destroy-" + deployment.deploymentWorkspace}
      label={label}
      checked={checked}
      handleOnChange={handleAutoDeleteChange}
      disabled={disabled}
      tooltipMessage="If enabled, the deployment will be automatically deleted after the specified time."
      tooltipDelay={1000}
    />
  );
}
