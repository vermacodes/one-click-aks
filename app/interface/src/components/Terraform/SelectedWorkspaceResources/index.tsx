import { useContext } from "react";
import { useLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import { useDestroy } from "../../../hooks/useTerraform";
import {
  useAddWorkspace,
  useDeleteWorkspace,
  useGetResources,
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import Button from "../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../WebSocketContext";
import {
  getSelectedTerraformWorkspace,
  isDefaultWorkspaceSelected,
} from "../../../utils/helpers";

type Props = {};

export default function SelectedWorkspaceResources({}: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { data: resources, isFetching: fetchingResources } = useGetResources();
  const { data: lab } = useLab();
  const { mutate: setLogs } = useSetLogs();
  const {
    data: workspaces,
    isFetching: fetchingWorkspaces,
    isLoading: gettingWorkspaces,
  } = useTerraformWorkspace();
  const { mutate: deleteWorkspace, isLoading: deletingWorkspace } =
    useDeleteWorkspace();
  const { mutateAsync: selectWorkspaceAsync, isLoading: selectingWorkspace } =
    useSelectWorkspace();
  const { isLoading: addingWorkspace } = useAddWorkspace();
  const { mutateAsync: destroyAsync } = useDestroy();

  function destroyHandler() {
    setLogs({ logs: "" });
    lab && destroyAsync(lab);
  }

  function destroyAndDeleteHandler() {
    if (lab === undefined || workspaces === undefined) {
      return;
    }
    // Set logs streaming.
    setLogs({ logs: "" });
    // Execute and wait for destroy to complete.
    destroyAsync(lab).then(() => {
      // Get the current workspace.
      const workspace = getSelectedTerraformWorkspace(workspaces);
      if (workspace === undefined) {
        console.error("not able to get the current workspace");
        return;
      }
      // Change the workspace to default.
      selectWorkspaceAsync({ name: "default", selected: true }).then(() => {
        // Delete workspace.
        deleteWorkspace(workspace);
      });
    });
  }

  return (
    <div className="w-full justify-between gap-y-4 rounded border border-slate-500 py-2">
      <div className="h-48 rounded px-2 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 scrollbar-track-rounded-full scrollbar-thumb-rounded-full dark:scrollbar-thumb-slate-600">
        {fetchingResources ||
        gettingWorkspaces ||
        selectingWorkspace ||
        deletingWorkspace ||
        addingWorkspace ||
        fetchingWorkspaces ? (
          <pre className="text-slate-500">Please wait...</pre>
        ) : (
          <>
            {actionStatus.inProgress ? (
              <p className="text-slate-500">
                Action is in progress. Please wait...
              </p>
            ) : (
              <pre>
                {resources === undefined || resources === ""
                  ? "No resources deployed."
                  : resources}
              </pre>
            )}
          </>
        )}
      </div>
      <div className="flex w-full justify-between gap-x-4 px-2">
        <Button
          variant="danger-outline"
          //disabled
          disabled={
            actionStatus.inProgress ||
            fetchingResources ||
            gettingWorkspaces ||
            selectingWorkspace ||
            deletingWorkspace ||
            addingWorkspace ||
            fetchingWorkspaces ||
            isDefaultWorkspaceSelected(workspaces)
          }
          onClick={() => destroyAndDeleteHandler()}
        >
          Delete Workspace
        </Button>
        <Button
          variant="danger"
          disabled={resources === "" || actionStatus.inProgress}
          onClick={() => destroyHandler()}
        >
          Destroy Resources
        </Button>
      </div>
    </div>
  );
}
