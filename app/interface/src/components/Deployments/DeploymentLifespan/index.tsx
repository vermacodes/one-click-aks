import { useState } from "react";
import { DeploymentType } from "../../../dataStructures";
import { FaChevronDown } from "react-icons/fa";
import { usePatchDeployment } from "../../../hooks/useDeployments";
import { calculateNewEpochTimeForDeployment } from "../../../utils/helpers";
import { toast } from "react-toastify";
import Tooltip from "../../UserInterfaceComponents/Tooltip";

type DeploymentLifespanProps = {
  deployment: DeploymentType;
};
export default function DeploymentLifespan({
  deployment,
}: DeploymentLifespanProps) {
  const [menu, setMenu] = useState<boolean>(false);

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
    setMenu(false);
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
            return `Failed to update deployment. ${data.data.data}`;
          },
          autoClose: 5000,
        },
      },
      {
        toastId: "deployment-lifespan",
      }
    );
  }

  return (
    <div className={`${menu ? "relative" : ""} inline-block text-left`}>
      <Tooltip
        message="The deployment will be automatically deleted after the specified duration."
        delay={1000}
      >
        <div
          className={`flex w-32 items-center justify-between rounded border border-slate-500 px-2 py-1`}
          onClick={(e) => {
            setMenu(!menu);
            e.stopPropagation();
          }}
        >
          {secondsToHoursOrMinutes(deployment.deploymentLifespan)}
          <p>
            <FaChevronDown />
          </p>
        </div>
      </Tooltip>
      <div
        className={`absolute right-0 z-10 mt-2 h-44 w-32 origin-top-right overflow-y-auto overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 ${
          !menu && "hidden"
        } items-center gap-y-2 rounded border border-slate-500 bg-slate-100 p-2 dark:bg-slate-800`}
        onMouseLeave={() => setMenu(false)}
      >
        {lifespans.map((lifespan) => (
          <div
            className={`${
              lifespan === deployment.deploymentLifespan &&
              "bg-green-300 hover:text-slate-900 dark:text-slate-900"
            } w-full cursor-pointer items-center justify-between rounded p-2 hover:bg-sky-500 hover:text-slate-100`}
            key={lifespan}
            onClick={() => handleDeploymentLifespanChange(lifespan)}
          >
            {secondsToHoursOrMinutes(lifespan)}
          </div>
        ))}
      </div>
    </div>
  );
}
