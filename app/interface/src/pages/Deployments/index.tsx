import { Link } from "react-router-dom";
import AddTerraformWorkspace from "../../components/AddTerraformWorkspace";
import Deployment from "../../components/Deployment";
import { DeploymentType } from "../../dataStructures";
import { useGetMyDeployments } from "../../hooks/useDeployments";
import { useTerraformWorkspace } from "../../hooks/useWorkspace";
import PageLayout from "../../layouts/PageLayout";
import Button from "../../components/Button";

export default function Deployments() {
  const { data } = useTerraformWorkspace();
  const { data: deployments } = useGetMyDeployments();

  return (
    <PageLayout heading="Deployments">
      <div className={`mb-3 flex justify-end space-x-4 rounded`}>
        <AddTerraformWorkspace />
        <Link to="/builder">
          <Button variant="secondary-text">Lab Builder</Button>
        </Link>
      </div>
      {deployments &&
        deployments.length > 0 &&
        deployments.map((deployment: DeploymentType) => (
          <>
            <Deployment deployment={deployment} />
          </>
        ))}
    </PageLayout>
  );
}
