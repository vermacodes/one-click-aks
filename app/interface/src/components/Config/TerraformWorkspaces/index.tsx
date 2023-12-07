import { Link } from "react-router-dom";
import SelectedWorkspaceResources from "../../Terraform/SelectedWorkspaceResources";
import Workspaces from "../../Terraform/Workspaces";
import Container from "../../UserInterfaceComponents/Container";

type WorkspaceProps = {};

export default function TerraformWorkspaces({}: WorkspaceProps) {
  return (
    <Container title="Terraform Workspace" collapsible={true}>
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full justify-between gap-x-4">
            <Workspaces />
          </div>
          <div className="flex justify-end">
            <SelectedWorkspaceResources />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-slate-700 dark:text-slate-300">
            1. If you see no workspaces listed. Thats probably because terraform
            is not yet initialized. This will populate once terraform is
            initialized.
          </p>
          <p className="w-full rounded border border-yellow-600 bg-yellow-600 bg-opacity-10 py-1 px-3 text-xs md:w-fit">
            Terraform workspaces are managed by{" "}
            <Link to={"/deployments"} className="text-sky-500 underline">
              deployments
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}
