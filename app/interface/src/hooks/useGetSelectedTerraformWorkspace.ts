import { useMemo } from "react";
import { TerraformWorkspace } from "../dataStructures";
import { useTerraformWorkspace } from "./useWorkspace";

export function useGetSelectedTerraformWorkspace() {
  const { data: terraformWorkspaces } = useTerraformWorkspace();

  function getSelectedTerraformWorkspace(
    terraformWorkspaces: TerraformWorkspace[]
  ): TerraformWorkspace | undefined {
    var selectedWorkspace = terraformWorkspaces.find(
      (workspace) => workspace.selected
    );
    if (selectedWorkspace) {
      return selectedWorkspace;
    } else {
      return undefined;
    }
  }

  const selectedTerraformWorkspace = useMemo(() => {
    if (!terraformWorkspaces) {
      return undefined;
    }
    return getSelectedTerraformWorkspace(terraformWorkspaces);
  }, [terraformWorkspaces]);

  return { selectedTerraformWorkspace };
}
