import { DeploymentType } from "../../../dataStructures";
import DestroyButton from "../../Terraform/ActionButtons/DestroyButton";
import AutoDestroySwitch from "../AutoDestroySwitch";
import DestroyTime from "../DestroyTime";
import DeploymentLifespan from "../DeploymentLifespan";
import SelectDeployment from "../SelectDeployment";
import DeploymentStatus from "../DeploymentStatus";
import BreakBlobLease from "../BreakBlobLease";

type Props = {
  deployment: DeploymentType;
  selectedDeployment?: DeploymentType;
};

export default function Deployment({ deployment, selectedDeployment }: Props) {
  return (
    <div
      className={`${
        deployment.deploymentWorkspace ===
        selectedDeployment?.deploymentWorkspace
          ? "outline outline-green-500 dark:outline-green-500"
          : ""
      } mb-3 rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div className="flex justify-between gap-2 text-sm">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
          <h1 className="text-xl text-sky-500">
            {deployment.deploymentWorkspace}
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-y-2 gap-x-2">
          <DeploymentStatus deployment={deployment} />
          <AutoDestroySwitch
            deployment={deployment}
            disabled={false}
            label="Auto Destroy"
            key={deployment.deploymentId}
          />
          <DeploymentLifespan deployment={deployment} />
          <DestroyTime deployment={deployment} />
          <SelectDeployment deployment={deployment} variant="primary-outline" />
          <BreakBlobLease deployment={deployment} />
          <DestroyButton
            variant="danger-outline"
            lab={deployment.deploymentLab}
            disabled={
              selectedDeployment === undefined ||
              deployment.deploymentWorkspace !==
                selectedDeployment.deploymentWorkspace
            }
          >
            Destroy
          </DestroyButton>

          <DestroyButton
            variant="danger-outline"
            lab={deployment.deploymentLab}
            deleteWorkspace={true}
            deployment={deployment}
            disabled={
              selectedDeployment === undefined ||
              deployment.deploymentWorkspace !==
                selectedDeployment.deploymentWorkspace ||
              selectedDeployment.deploymentWorkspace === "default"
            }
          >
            Delete
          </DestroyButton>
        </div>
      </div>
    </div>
  );
}
