import { toast } from "react-toastify";
import { DeploymentType } from "../../../dataStructures";
import { usePatchDeployment } from "../../../hooks/useDeployments";
import { calculateNewEpochTimeForDeployment } from "../../../utils/helpers";
import DropdownSelect from "../../UserInterfaceComponents/DropdownSelect";

type DeploymentLifespanProps = {
  deployment: DeploymentType;
};
export default function DeploymentLifespan({
  deployment,
}: DeploymentLifespanProps) {
  // array allowed lifespans in seconds.
  const lifespans = [
    120, 300, 600, 900, 1800, 3600, 7200, 14400, 28800, 43200, 86400, 172800,
    259200, 604800,
  ];
  const { mutateAsync: patchDeployment } = usePatchDeployment();

  function secondsToHoursOrMinutes(seconds: number) {
    if (seconds < 3600) {
      return seconds / 60 === 1
        ? "1 Minute"
        : Math.floor(seconds / 60) + " Minutes";
    } else if (seconds < 86400) {
      return seconds / 3600 === 1
        ? "1 Hour"
        : Math.floor(seconds / 3600) + " Hours";
    } else {
      return seconds / 86400 === 1
        ? "1 Day"
        : Math.floor(seconds / 86400) + " Days";
    }
  }

  function handleDeploymentLifespanChange(lifespan: number) {
    toast.promise(
      patchDeployment({
        ...deployment,
        deploymentLifespan: lifespan,
        deploymentAutoDeleteUnixTime: calculateNewEpochTimeForDeployment({
          ...deployment,
          deploymentLifespan: lifespan,
        }),
      }),
      {
        pending: "Updating deployment...",
        success: {
          render(data: any) {
            return `Deployment updated.`;
          },
          autoClose: 2000,
        },
        error: {
          render(data: any) {
            return `Failed to update deployment. ${data.data.response.data.error}`;
          },
          autoClose: 5000,
        },
      },
      {
        toastId: "deployment-lifespan",
      }
    );
  }

  const renderItem = (lifespan: number) => {
    return (
      <div
        className={`${
          lifespan === deployment.deploymentLifespan &&
          "bg-green-300 hover:text-slate-900 dark:text-slate-900"
        } w-full cursor-pointer items-center justify-between rounded p-2 hover:bg-sky-500 hover:text-slate-100`}
      >
        {secondsToHoursOrMinutes(lifespan)}
      </div>
    );
  };

  return (
    <div className="w-32 min-w-fit">
      <DropdownSelect
        heading={secondsToHoursOrMinutes(deployment.deploymentLifespan)}
        items={lifespans}
        onItemClick={handleDeploymentLifespanChange}
        renderItem={renderItem}
        tooltipMessage="The deployment will be automatically deleted after the specified duration."
        tooltipDelay={1000}
      />
    </div>
  );
}
