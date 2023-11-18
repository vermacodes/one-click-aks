import { Link } from "react-router-dom";
import Deployment from "../../components/Deployments/Deployment";
import { DeploymentType } from "../../dataStructures";
import { useGetMyDeployments } from "../../hooks/useDeployments";
import PageLayout from "../../layouts/PageLayout";
import Button from "../../components/UserInterfaceComponents/Button";
import Terminal from "../../components/Terminal";
import CreateNewDeployment from "../../components/Deployments/CreateNewDeployment";
import { useTerraformWorkspace } from "../../hooks/useWorkspace";
import { FaPlus, FaTools } from "react-icons/fa";
import { useServerStatus } from "../../hooks/useServerStatus";
import ServerError from "../ServerError";
import { useEffect } from "react";
import { useSelectedDeployment } from "../../hooks/useSelectedDeployment";

export default function Deployments() {
  const { data: deployments } = useGetMyDeployments();
  const { data: workspaces } = useTerraformWorkspace();
  const { data: serverStatus } = useServerStatus();

  useEffect(() => {
    document.title = "ACT Labs | Deployments";
  }, []);

  if (serverStatus?.status !== "OK") {
    return <ServerError />;
  }

  if (deployments === undefined || workspaces === undefined) {
    return <></>;
  }

  const { selectedDeployment } = useSelectedDeployment();

  return (
    <PageLayout heading="Deployments">
      <div className={`mb-3 flex justify-end space-x-4 rounded`}>
        <Link to="/builder">
          <Button variant="secondary-outline">
            <FaTools /> Lab Builder
          </Button>
        </Link>
        <CreateNewDeployment variant="primary">
          <FaPlus /> Add Deployment
        </CreateNewDeployment>
      </div>
      {deployments &&
        deployments.length > 0 &&
        deployments.map((deployment: DeploymentType) => (
          <Deployment
            deployment={deployment}
            selectedDeployment={selectedDeployment}
            key={deployment.deploymentId}
          />
        ))}
      <Terminal />
    </PageLayout>
  );
}
