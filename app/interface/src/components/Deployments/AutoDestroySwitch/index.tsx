import { DeploymentType } from "../../../dataStructures";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import { usePatchDeployment } from "../../../hooks/useDeployments";
import { calculateNewEpochTimeForDeployment } from "../../../utils/helpers";

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

  function handleAutoDeleteChange() {
    //Switch the auto delete state
    deployment.deploymentAutoDelete = !deployment.deploymentAutoDelete;

    // if the auto delete is disabled, then set the time to 0.
    if (!deployment.deploymentAutoDelete) {
      asyncPatchDeployment({
        ...deployment,
        deploymentAutoDeleteUnixTime: 0,
      });
      return;
    }

    // if auto delete is enabled, then set the time to whatever it should be.
    if (deployment.deploymentAutoDelete) {
      asyncPatchDeployment({
        ...deployment,
        deploymentAutoDeleteUnixTime:
          calculateNewEpochTimeForDeployment(deployment),
      });
      return;
    }
  }

  return (
    <Checkbox
      id={"auto-destroy-" + deployment.deploymentWorkspace}
      label={label}
      checked={deployment.deploymentAutoDelete}
      handleOnChange={handleAutoDeleteChange}
      disabled={disabled}
    />
  );
}
