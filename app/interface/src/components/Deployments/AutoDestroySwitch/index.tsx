import { DeploymentType } from "../../../dataStructures";
import Checkbox from "../../Checkbox";
import { useUpsertDeployment } from "../../../hooks/useDeployments";
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
  const { mutateAsync: asyncUpsertDeployment } = useUpsertDeployment();

  function handleAutoDeleteChange() {
    console.log("on auto delete : " + deployment.deploymentWorkspace);

    //Switch the autodelete state
    deployment.deploymentAutoDelete = !deployment.deploymentAutoDelete;

    // if the autodelete is disabled, then set the time to 0.
    if (!deployment.deploymentAutoDelete) {
      asyncUpsertDeployment({
        ...deployment,
        deploymentAutoDeleteUnixTime: 0,
      });
      return;
    }

    // if auto delete is enabled, then set the time to whatever it should be.
    if (deployment.deploymentAutoDelete) {
      asyncUpsertDeployment({
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
