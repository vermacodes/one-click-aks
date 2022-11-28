import { useQueryClient } from "react-query";
import { TerraformWorkspace } from "../../dataStructures";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import {
  useDeleteWorkspace,
  useGetResources,
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../hooks/useTfActions";
import { axiosInstance } from "../../utils/axios-interceptors";
import Button from "../Button";
import { defaultTfvarConfig } from "../Tfvar/defaults";

type Props = {};

export default function TfResources({}: Props) {
  const { data: actionStatus } = useActionStatus();
  const { data: resources, isFetching: fetchingResources } = useGetResources();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const { data: workspaces } = useTerraformWorkspace();
  const { mutate: deleteWorkspace } = useDeleteWorkspace();
  const { mutate: selectWorkspace } = useSelectWorkspace();
  const queryClient = useQueryClient();

  function destroyHandler() {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("destroy", defaultTfvarConfig);
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
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("destroy", defaultTfvarConfig).then(() => {
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
        console.log("reached here");
        returned = true;
      }
    });
    console.log("reached here too.");
    return returned;
  }

  console.log(fetchingResources);

  return (
    <div className="w-1/2 justify-between space-y-4 rounded border border-slate-500 py-2">
      <div className="scroll-y-auto scroll-x-hidden h-48 rounded px-2 scrollbar-thin">
        {fetchingResources ? (
          <pre className="text-slate-500">
            Fetching resources. Please wait...
          </pre>
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
      <div className="flex w-full justify-between space-x-4 px-2">
        <Button
          variant="danger-outline"
          //disabled
          disabled={actionStatus || isDefaultSelected(workspaces)}
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
