import SettingsItemLayout from "../../../layouts/SettingsItemLayout";
import SelectedWorkspaceResources from "../../Terraform/SelectedWorkspaceResources";
import Workspaces from "../../Terraform/Workspaces";

type WorkspaceProps = {};

export default function TerraformWorkspaces({}: WorkspaceProps) {
  return (
    <SettingsItemLayout>
      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between py-2">
          <div>
            <h2 className="text-lg">Terraform Workspace</h2>
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="flex w-full justify-between gap-x-4">
              <Workspaces />
            </div>
            <div className="flex justify-end">
              <SelectedWorkspaceResources />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-xs text-slate-700 dark:text-slate-300">
            - If you see no workspaces listed. Thats probably because terraform
            is not yet initialized. This will populate once terraform is
            initialized.
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            - Workspaces are managed via deployments.
          </p>
        </div>
      </div>
    </SettingsItemLayout>
  );
}
