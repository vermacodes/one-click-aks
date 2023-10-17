import { DeploymentType } from "../../../dataStructures";
import Button from "../../Button";
import {
  useSelectWorkspace,
  useSelectedTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import { useContext, useState } from "react";
import DestroyButton from "../../Terraform/DestroyButton";
import AutoDestroySwitch from "../AutoDestroySwitch";
import DestroyTime from "../DestroyTime";
import DeploymentLifespan from "../DeploymentLifespan";
import { useActionStatus } from "../../../hooks/useActionStatus";
import SelectDeployment from "../SelectDeployment";
import { WebSocketContext } from "../../../WebSocketContext";

type Props = {
  deployment: DeploymentType;
};

export default function Deployment({ deployment }: Props) {
  const { data: selectedTerraformWorkspace } = useSelectedTerraformWorkspace();
  const { mutateAsync: asyncSelectWorkspace } = useSelectWorkspace();
  const { data: actionStatus } = useContext(WebSocketContext);

  return (
    <div
      className={`${
        deployment.deploymentWorkspace === selectedTerraformWorkspace?.name
          ? "outline outline-green-500 dark:outline-green-500"
          : ""
      } mb-3 rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div className="flex justify-between">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
          <h1 className="text-xl text-sky-500">
            {deployment.deploymentWorkspace}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
          <p>{deployment.deploymentStatus}</p>
          <AutoDestroySwitch
            deployment={deployment}
            disabled={false}
            label="Auto Destroy"
            key={deployment.deploymentId}
          />
          <DeploymentLifespan deployment={deployment} />
          <DestroyTime deployment={deployment} />
          <SelectDeployment deployment={deployment} variant="primary-outline" />
          <DestroyButton
            variant="danger-outline"
            lab={deployment.deploymentLab}
            disabled={
              selectedTerraformWorkspace === undefined ||
              deployment.deploymentWorkspace !== selectedTerraformWorkspace.name
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
              selectedTerraformWorkspace === undefined ||
              deployment.deploymentWorkspace !==
                selectedTerraformWorkspace.name ||
              selectedTerraformWorkspace.name === "default"
            }
          >
            Delete
          </DestroyButton>
        </div>
      </div>
    </div>
  );
}
