import { useContext, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import {
  useGetResources,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import Button from "../../UserInterfaceComponents/Button";
import { useUpsertDeployment } from "../../../hooks/useDeployments";
import { useLab } from "../../../hooks/useLab";
import { WebSocketContext } from "../../../WebSocketContext";
import { getSelectedTerraformWorkspace } from "../../../utils/helpers";

type WorkspaceProps = {};

export default function Workspaces({}: WorkspaceProps) {
  const [add, setAdd] = useState<boolean>(false);
  const [newWorkSpaceName, setNewWorkSpaceName] = useState<string>("");
  const [workspaceMenu, setWorkspaceMenu] = useState<boolean>(false);
  const {
    data: workspaces,
    refetch: refetchWorkspaces,
    isLoading: gettingWorkspaces,
    isFetching: fetchingWorkspaces,
    isError: workspaceError,
  } = useTerraformWorkspace();
  const { isFetching: fetchingResources } = useGetResources();
  const { mutate: upsertDeployment } = useUpsertDeployment();
  const { actionStatus } = useContext(WebSocketContext);
  const { data: lab } = useLab();

  if (workspaces === undefined) {
    return (
      <div className="flex w-96 rounded border border-slate-500 p-2">
        <p>No workspaces found</p>
      </div>
    );
  }

  const selectedTerraformWorkspace = getSelectedTerraformWorkspace(workspaces);

  return (
    <div className="flex w-96 rounded border border-slate-500 p-2">
      <p>{selectedTerraformWorkspace?.name}</p>
    </div>
  );
}
