import Button from "../../UserInterfaceComponents/Button";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import { SiTerraform } from "react-icons/si";
import { useGetMyDeployments } from "../../../hooks/useDeployments";
import { useLab } from "../../../hooks/useLab";
import { Link } from "react-router-dom";
import CreateNewDeployment from "../CreateNewDeployment";
import AutoDestroySwitch from "../AutoDestroySwitch";
import DestroyTime from "../DestroyTime";
import DeploymentLifespan from "../DeploymentLifespan";
import { getSelectedDeployment } from "../../../utils/helpers";

export default function SelectedDeployment() {
  const { data: lab } = useLab();
  const { data: terraformWorkspace } = useTerraformWorkspace();
  const { data: deployments } = useGetMyDeployments();

  if (
    terraformWorkspace === undefined ||
    lab === undefined ||
    deployments === undefined
  ) {
    return <></>;
  }

  var selectedDeployment = getSelectedDeployment(
    deployments,
    terraformWorkspace
  );
  if (selectedDeployment === undefined) {
    //set default deployment as selected
    selectedDeployment = deployments.filter(
      (deployment) => deployment.deploymentWorkspace === "default"
    )[0];
  }

  return (
    <div
      className={`mb-3 rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div
        className="flex justify-between"
        key={selectedDeployment.deploymentId}
      >
        <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
          <h1 className="text-xl">
            <SiTerraform />
          </h1>
          <h1 className="text-2xl text-sky-500">
            <div>{selectedDeployment.deploymentWorkspace}</div>
          </h1>
        </div>
        <div className="flex flex-wrap gap-y-2 gap-x-4 divide-x divide-slate-500">
          <div className="flex flex-wrap items-center gap-x-2">
            {selectedDeployment.deploymentStatus}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 pl-2">
            <AutoDestroySwitch
              deployment={selectedDeployment}
              disabled={false}
              label="Auto Destroy"
              key={selectedDeployment.deploymentId}
            />
            <DeploymentLifespan deployment={selectedDeployment} />
            <DestroyTime deployment={selectedDeployment} />
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
    </div>
  );
}
