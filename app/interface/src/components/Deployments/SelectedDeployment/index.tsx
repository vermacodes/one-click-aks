import Button from "../../UserInterfaceComponents/Button";
import { FaPlus, FaBinoculars } from "react-icons/fa";
import { SiTerraform } from "react-icons/si";
import { useGetMyDeployments } from "../../../hooks/useDeployments";
import { Link } from "react-router-dom";
import AutoDestroySwitch from "../AutoDestroySwitch";
import DestroyTime from "../DestroyTime";
import DeploymentLifespan from "../DeploymentLifespan";
import DeploymentStatus from "../DeploymentStatus";
import CreateNewDeployment from "../CreateNewDeployment";
import BreakBlobLease from "../BreakBlobLease";
import { useSelectedDeployment } from "../../../hooks/useSelectedDeployment";
import { DeploymentType } from "../../../dataStructures";
import { useEffect, useState } from "react";

type Props = {
  sticky?: boolean;
};

export default function SelectedDeployment({ sticky = true }: Props) {
  const { data: deployments } = useGetMyDeployments();
  const { selectedDeployment } = useSelectedDeployment();
  const [selectedDeploymentState, setSelectedDeploymentState] = useState<
    DeploymentType | undefined
  >(undefined);

  useEffect(() => {
    if (selectedDeployment !== undefined) {
      setSelectedDeploymentState(selectedDeployment);
    } else if (deployments !== undefined) {
      setSelectedDeploymentState(
        deployments.filter(
          (deployment) => deployment.deploymentWorkspace === "default"
        )[0]
      );
    }
  }, [selectedDeployment, deployments]);

  if (selectedDeploymentState === undefined) {
    return <></>;
  }

  return (
    <div
      className={`${
        sticky && "sticky top-0 z-20"
      } mb-3 rounded bg-slate-50 p-3 shadow outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div
        className="flex justify-between gap-2 text-sm"
        key={selectedDeploymentState.deploymentId}
      >
        <div className="flex items-center gap-x-2 ">
          <SiTerraform className="text-xl" />
          <h1 className="text-xl text-sky-500">
            {selectedDeploymentState.deploymentWorkspace}
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DeploymentStatus deployment={selectedDeploymentState} />
          <div className="mx-2 h-6 border-r border-gray-300"></div>
          <AutoDestroySwitch
            deployment={selectedDeploymentState}
            disabled={false}
            label="Auto Destroy"
            key={selectedDeploymentState.deploymentId}
          />
          <DeploymentLifespan deployment={selectedDeploymentState} />
          <DestroyTime deployment={selectedDeploymentState} />
          <div className="mx-2 h-6 border-r border-gray-300"></div>
          <BreakBlobLease
            deployment={selectedDeploymentState}
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
