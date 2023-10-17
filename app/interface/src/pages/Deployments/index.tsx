import { Link } from "react-router-dom";
import Deployment from "../../components/Deployments/Deployment";
import { DeploymentType } from "../../dataStructures";
import { useGetMyDeployments } from "../../hooks/useDeployments";
import PageLayout from "../../layouts/PageLayout";
import Button from "../../components/Button";
import Terminal from "../../components/Terminal";
import CreateNewDeployment from "../../components/Deployments/CreateNewDeployment";

export default function Deployments() {
  const { data: deployments } = useGetMyDeployments();

  return (
    <PageLayout heading="Deployments">
      <div className={`mb-3 flex justify-end space-x-4 rounded`}>
        <Link to="/builder">
          <Button variant="secondary-outline">Open Lab Builder</Button>
        </Link>
        <CreateNewDeployment variant="primary">
          New Deployment
        </CreateNewDeployment>
      </div>
      {deployments &&
        deployments.length > 0 &&
        deployments.map((deployment: DeploymentType) => (
          <>
            <Deployment deployment={deployment} key={deployment.deploymentId} />
          </>
        ))}
      <Terminal />
    </PageLayout>
  );
}
