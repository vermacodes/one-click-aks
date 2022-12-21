import { TerraformWorkspace } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import { useDestroy } from "../../hooks/useTerraform";
import {
  useAddWorkspace,
  useDeleteWorkspace,
  useGetResources,
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../hooks/useWorkspace";
import Button from "../Button";

type Props = {};

export default function TfResources({}: Props) {
  const { data: actionStatus } = useActionStatus();
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
  const { mutate: destroy, mutateAsync: destroyAsync } = useDestroy();

  function destroyHandler() {
    setLogs({ isStreaming: true, logs: "" });
    lab && destroy(lab);
  }

  async function getSelectedWorkspace(): Promise<TerraformWorkspace> {
    return new Promise((resolve, reject) => {
      if (workspaces === undefined) {
        reject(Error("workspaces are not defined"));
      } else {
        workspaces.map((workspace) => {
          if (workspace.selected === true) {
            resolve(workspace);
          }
        });
      }
    });
  }

  function destroyAndDeleteHandler() {
    if (lab !== undefined) {
      // Set logs streaming.
      setLogs({ isStreaming: true, logs: "" });
      // Execute and wait for destroy to complete.
      destroyAsync(lab).then(() => {
        // Get the current workspace.
        getSelectedWorkspace()
          .then((workspace) => {
            // Change the worksapace to default.
            selectWorkspaceAsync({ name: "default", selected: true }).then(
              () => {
                // Delete workspace.
                deleteWorkspace(workspace);
              }
            );
          })
          .catch(() => {
            console.error("not able to get the selected workspace.");
          });
      });
    }
  }

  function isDefaultSelected(
    workspaces: TerraformWorkspace[] | undefined
  ): boolean {
    var returned: boolean = false;

    if (workspaces === undefined) {
      returned = true;
    }
    workspaces?.forEach((workspace) => {
      if (workspace.name === "default" && workspace.selected === true) {
        returned = true;
      }
    });
    return returned;
  }
  return (
    <div className="w-1/2 justify-between gap-y-4 rounded border border-slate-500 py-2">
      <div className="h-48 overflow-x-hidden rounded px-2 scrollbar-thin scrollbar-track-slate-400 scrollbar-thumb-sky-500 scrollbar-track-rounded-full scrollbar-thumb-rounded-full">
        {fetchingResources ||
        gettingWorkspaces ||
        selectingWorkspace ||
        deletingWorkspace ||
        addingWorkspace ||
        fetchingWorkspaces ? (
          <pre className="text-slate-500">Please wait...</pre>
        ) : (
          <>
            {actionStatus ? (
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
            actionStatus ||
            fetchingResources ||
            gettingWorkspaces ||
            selectingWorkspace ||
            deletingWorkspace ||
            addingWorkspace ||
            fetchingWorkspaces ||
            isDefaultSelected(workspaces)
          }
          onClick={() => destroyAndDeleteHandler()}
        >
          Delete Workspace
        </Button>
        <Button
          variant="danger"
          disabled={resources === "" || actionStatus}
          onClick={() => destroyHandler()}
        >
          Destroy Resources
        </Button>
      </div>
    </div>
  );
}
