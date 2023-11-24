import { DeploymentType } from "../../../dataStructures";
import { getDeploymentDestroyTime } from "../../../utils/helpers";
import Tooltip from "../../UserInterfaceComponents/Tooltip";

type DestroyTimeProps = {
  deployment: DeploymentType;
};

export default function DestroyTime({ deployment }: DestroyTimeProps) {
  return (
    <Tooltip
      message="Deployment will be auto-destroyed at this time."
      delay={1000}
    >
      <div
        className={`flex w-52 min-w-fit items-center justify-between rounded border border-slate-500 px-2 py-1`}
      >
        {getDeploymentDestroyTime(deployment)}
      </div>
    </Tooltip>
  );
}
