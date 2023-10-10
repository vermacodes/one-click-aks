import Deployment from "../../components/Deployment";
import { DeploymentType } from "../../dataStructures";
import { useGetMyDeployments } from "../../hooks/useDeployments";
import { useTerraformWorkspace } from "../../hooks/useWorkspace";
import PageLayout from "../../layouts/PageLayout";

export default function Deployments() {
  const { data } = useTerraformWorkspace();
  const { data: deployments } = useGetMyDeployments();

  return (
    <PageLayout heading="Deployments">
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
