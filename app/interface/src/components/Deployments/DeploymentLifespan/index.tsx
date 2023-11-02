import { useState } from "react";
import { DeploymentType } from "../../../dataStructures";
import { FaChevronDown } from "react-icons/fa";
import { usePatchDeployment } from "../../../hooks/useDeployments";
import { calculateNewEpochTimeForDeployment } from "../../../utils/helpers";

type DeploymentLifespanProps = {
  deployment: DeploymentType;
};
export default function DeploymentLifespan({
  deployment,
}: DeploymentLifespanProps) {
  const [menu, setMenu] = useState<boolean>(false);

  // array allowed lifespans in seconds.
  const lifespans = [120, 300, 600, 900, 1800, 3600, 7200, 14400, 28800];
  const { mutate: patchDeployment } = usePatchDeployment();

  // Function takes input in seconds and returns hours or minutes if less than an hour.
  function secondsToHoursOrMinutes(seconds: number) {
    if (seconds < 3600) {
      return Math.floor(seconds / 60) + " Minutes";
    }
    return Math.floor(seconds / 3600) + " Hours";
  }

  return (
    <div className={`${menu ? "relative" : ""} inline-block text-left`}>
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
            onClick={() => {
              setMenu(false);
              patchDeployment({
                ...deployment,
                deploymentLifespan: lifespan,
                deploymentAutoDeleteUnixTime:
                  calculateNewEpochTimeForDeployment({
                    ...deployment,
                    deploymentLifespan: lifespan,
                  }),
              });
            }}
          >
            {secondsToHoursOrMinutes(lifespan)}
          </div>
        ))}
      </div>
    </div>
  );
}
