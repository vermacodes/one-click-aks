import { useQueryClient } from "react-query";
import { TerraformWorkspace } from "../../dataStructures";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import {
  useAddWorkspace,
  useDeleteWorkspace,
  useGetResources,
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../hooks/useTfActions";
import { axiosInstance } from "../../utils/axios-interceptors";
import Button from "../Button";

type Props = {};

export default function TfResources({}: Props) {
  const { data: actionStatus } = useActionStatus();
  const { data: resources, isFetching: fetchingResources } = useGetResources();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { data: lab } = useLab();
  const { mutate: setLogs } = useSetLogs();
  const {
    data: workspaces,
    isFetching: fetchingWorkspaces,
    isLoading: gettingWorkspaces,
  } = useTerraformWorkspace();
  const { mutate: deleteWorkspace, isLoading: deletingWorkspace } =
    useDeleteWorkspace();
  const { isLoading: selectingWorkspace } = useSelectWorkspace();
  const { isLoading: addingWorkspace } = useAddWorkspace();

  const queryClient = useQueryClient();

  function destroyHandler() {
    queryClient.setQueryData("get-action-status", { inProgress: true });
    setTimeout(() => {
      queryClient.invalidateQueries("get-action-status");
      queryClient.invalidateQueries("get-resources");
    }, 50);

    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("destroy", lab);
  }

  function destroyAndDeleteHandler() {
    var selectedWorkspaceName = "";
    if (workspaces !== undefined) {
      workspaces.map((workspace) => {
        if (workspace.selected === true) {
          selectedWorkspaceName = workspace.name;
        }
      });
    }
    //setActionStatus({ inProgress: true });
    queryClient.setQueryData("get-action-status", { inProgress: true });
    setTimeout(() => {
      queryClient.invalidateQueries("get-action-status");
    }, 50);
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("destroy", lab).then(() => {
      axiosInstance
        .put("workspace", { name: "default", selected: true })
        .then(() => {
          if (workspaces !== undefined && selectedWorkspaceName !== "default") {
            workspaces.map((workspace) => {
              if (workspace.name === selectedWorkspaceName) {
                deleteWorkspace(workspace);
              }
            });
          }
        });
    });
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
      <div className="h-48 rounded px-2 overflow-x-hidden scrollbar-thin scrollbar-track-slate-400 scrollbar-thumb-sky-500 scrollbar-track-rounded-full scrollbar-thumb-rounded-full">
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
