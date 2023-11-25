import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import { useGetSelectedTerraformWorkspace } from "../../../hooks/useGetSelectedTerraformWorkspace";

type WorkspaceProps = {};

export default function Workspaces({}: WorkspaceProps) {
  const { data: workspaces } = useTerraformWorkspace();
  const { selectedTerraformWorkspace } = useGetSelectedTerraformWorkspace();

  if (workspaces === undefined) {
    return (
      <div className="flex w-full rounded border border-slate-500 p-2">
        <p>No workspaces found</p>
      </div>
    );
  }

  return (
    <div className="flex w-full rounded border border-slate-500 p-2">
      <p>{selectedTerraformWorkspace?.name}</p>
    </div>
  );
}
