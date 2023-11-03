import { DeploymentType } from "../../../dataStructures";
import { getDeploymentDestroyTime } from "../../../utils/helpers";

type DestroyTimeProps = {
  deployment: DeploymentType;
};

export default function DestroyTime({ deployment }: DestroyTimeProps) {
  return (
    <div
      className={`w-52 min-w-fit items-center justify-between rounded border border-slate-500 px-2 py-1`}
    >
      {getDeploymentDestroyTime(deployment)}
    </div>
  );
}
