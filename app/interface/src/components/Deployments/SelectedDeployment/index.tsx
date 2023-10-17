import Button from "../../Button";
import {
  useSelectedTerraformWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import { SiTerraform } from "react-icons/si";
import { useGetMyDeployments } from "../../../hooks/useDeployments";
import { useLab } from "../../../hooks/useLab";
import { DeploymentType } from "../../../dataStructures";
import { Link } from "react-router-dom";
import CreateNewDeployment from "../CreateNewDeployment";
import AutoDestroySwitch from "../AutoDestroySwitch";
import DestroyTime from "../DestroyTime";
import DeploymentLifespan from "../DeploymentLifespan";

export default function SelectedDeployment() {
  const { data: lab } = useLab();
  const { data: terraformWorkspace } = useTerraformWorkspace();
  const { data: selectedTerraformWorkspace } = useSelectedTerraformWorkspace();
  const { data: deployments } = useGetMyDeployments();

  if (
    terraformWorkspace === undefined ||
    lab === undefined ||
    deployments === undefined
  ) {
    return <></>;
  }

  return (
    <div
      className={`mb-3 rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      {deployments &&
        deployments.map(
          (deployment: DeploymentType) =>
            deployment.deploymentWorkspace ===
              selectedTerraformWorkspace?.name && (
              <div
                className="flex justify-between"
                key={deployment.deploymentId}
              >
                <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
                  <h1 className="text-xl">
                    <SiTerraform />
                  </h1>
                  <h1 className="text-2xl text-sky-500">
                    <div>
                      {selectedTerraformWorkspace &&
                        selectedTerraformWorkspace.name}
                    </div>
                  </h1>
                  {/* <CurrentTerraformWorkspace /> */}
                </div>
                <div className="flex flex-wrap gap-y-2 gap-x-4 divide-x divide-slate-500">
                  <div className="flex flex-wrap items-center gap-x-2">
                    {deployment.deploymentStatus}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 pl-2">
                    <AutoDestroySwitch
                      deployment={deployment}
                      disabled={false}
                      label="Auto Destroy"
                      key={deployment.deploymentId}
                    />
                    <DeploymentLifespan deployment={deployment} />
                    <DestroyTime deployment={deployment} />
                  </div>
                  <div className="flex flex-wrap gap-x-2 pl-2">
                    <Link to={"/deployments"}>
                      <Button variant="secondary-text">View Deployments</Button>
                    </Link>
                    <CreateNewDeployment variant="primary">
                      New Deployment
                    </CreateNewDeployment>
                  </div>
                </div>
              </div>
            )
        )}
    </div>
  );
}