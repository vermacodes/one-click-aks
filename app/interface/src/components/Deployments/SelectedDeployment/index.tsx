import Button from "../../UserInterfaceComponents/Button";
import { FaPlus, FaBinoculars } from "react-icons/fa";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import { SiTerraform } from "react-icons/si";
import { useGetMyDeployments } from "../../../hooks/useDeployments";
import { useLab } from "../../../hooks/useLab";
import { Link } from "react-router-dom";
import AutoDestroySwitch from "../AutoDestroySwitch";
import DestroyTime from "../DestroyTime";
import DeploymentLifespan from "../DeploymentLifespan";
import { getSelectedDeployment } from "../../../utils/helpers";
import DeploymentStatus from "../DeploymentStatus";
import CreateNewDeployment from "../CreateNewDeployment";
import BreakBlobLease from "../BreakBlobLease";

type Props = {
  sticky?: boolean;
};

export default function SelectedDeployment({ sticky = true }: Props) {
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
      className={`${
        sticky && "sticky top-0 z-20"
      } mb-3 rounded bg-slate-50 p-3 shadow outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div
        className="flex justify-between"
        key={selectedDeployment.deploymentId}
      >
        <div className="flex items-center gap-x-2">
          <SiTerraform className="text-xl" />
          <h1 className="text-2xl text-sky-500">
            {selectedDeployment.deploymentWorkspace}
          </h1>
        </div>
        <div className="flex items-center gap-x-2">
          <DeploymentStatus deployment={selectedDeployment} />
          <div className="mx-2 h-6 border-r border-gray-300"></div>
          <AutoDestroySwitch
            deployment={selectedDeployment}
            disabled={false}
            label="Auto Destroy"
            key={selectedDeployment.deploymentId}
          />
          <DeploymentLifespan deployment={selectedDeployment} />
          <DestroyTime deployment={selectedDeployment} />
          <div className="mx-2 h-6 border-r border-gray-300"></div>
          <BreakBlobLease
            deployment={selectedDeployment}
            buttonVariant="secondary-text"
          />
          <Link to={"/deployments"}>
            <Button
              variant="secondary-text"
              tooltipMessage="View all deployments"
              tooltipDelay={200}
            >
              <FaBinoculars /> View
            </Button>
          </Link>
          <CreateNewDeployment
            variant="primary-text"
            tooltipMessage="Add new deployment"
            tooltipDelay={200}
          >
            <FaPlus /> Add
          </CreateNewDeployment>
        </div>
      </div>
    </div>
  );
}
