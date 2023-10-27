import { useContext, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useSetActionStatus } from "../../../hooks/useActionStatus";
import {
  useAddWorkspace,
  useDeleteWorkspace,
  useGetResources,
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import Button from "../../UserInterfaceComponents/Button";
import { useUpsertDeployment } from "../../../hooks/useDeployments";
import { useLab } from "../../../hooks/useLab";
import { WebSocketContext } from "../../../WebSocketContext";

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
  const { mutate: selectWorkspace, isLoading: selectingWorkspace } =
    useSelectWorkspace();
  const { isLoading: deletingWorkspace } = useDeleteWorkspace();
  const { mutateAsync: asyncAddWorkspace, isLoading: addingWorkspace } =
    useAddWorkspace();
  const { mutate: upsertDeployment } = useUpsertDeployment();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setActionStatus } = useSetActionStatus();
  const { data: lab } = useLab();

  function handleWorkspaceNameTextField(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setNewWorkSpaceName(event.target.value);
  }

  function handleAddWorkspace() {
    if (lab !== undefined) {
      asyncAddWorkspace({ name: newWorkSpaceName, selected: true }).then(() => {
        setAdd(!add);
        setNewWorkSpaceName("");
        upsertDeployment({
          deploymentId: "",
          deploymentUserId: "",
          deploymentWorkspace: newWorkSpaceName,
          deploymentSubscriptionId: "",
          deploymentAutoDelete: false,
          deploymentAutoDeleteUnixTime: 0,
          deploymentLifespan: 28800,
          deploymentStatus: "Deployment Not Started",
          deploymentLab: lab,
        });
      });
    }
    console.error("Lab is undefined");
  }

  return (
    <div
      className="flex w-full justify-between gap-x-4"
      onDoubleClick={() => refetchWorkspaces}
    >
      <div className="relative inline-block text-left">
        <div
          className={` ${add && "hidden"} ${
            (actionStatus.inProgress ||
              gettingWorkspaces ||
              selectingWorkspace ||
              deletingWorkspace ||
              addingWorkspace ||
              fetchingWorkspaces ||
              fetchingResources) &&
            "text-slate-500"
          } flex w-96 items-center justify-between rounded border border-slate-500 p-2`}
          onClick={(e) => {
            if (
              !(
                actionStatus.inProgress ||
                gettingWorkspaces ||
                selectingWorkspace ||
                deletingWorkspace ||
                addingWorkspace ||
                fetchingWorkspaces ||
                fetchingResources
              )
            ) {
              setWorkspaceMenu(!workspaceMenu);
            }
            e.stopPropagation();
          }}
        >
          {" "}
          {workspaceError ? (
            <p>default</p>
          ) : (
            <>
              {gettingWorkspaces ||
              selectingWorkspace ||
              deletingWorkspace ||
              addingWorkspace ||
              fetchingWorkspaces ||
              fetchingResources ? (
                <p>Please wait...</p>
              ) : (
                <>
                  {workspaces?.map(
                    (workspace) =>
                      workspace.selected && (
                        <p key={workspace.name}>{workspace.name}</p>
                      )
                  )}
                </>
              )}
            </>
          )}
          <p>
            <FaChevronDown />
          </p>
        </div>
        <div
          className={`${
            !add && "hidden"
          } flex w-96 items-center justify-between rounded border border-slate-500`}
        >
          <input
            type="text"
            className="block h-10 w-full bg-inherit px-2 text-inherit"
            placeholder="Name your new workspace."
            value={newWorkSpaceName}
            onChange={handleWorkspaceNameTextField}
          ></input>
        </div>
        <div
          className={`absolute right-0 mt-2 h-56 w-96 origin-top-right overflow-y-auto overflow-x-hidden scrollbar ${
            !workspaceMenu && "hidden"
          } items-center gap-y-2 rounded border border-slate-500 bg-slate-100 p-2 dark:bg-slate-800`}
          onMouseLeave={() => setWorkspaceMenu(false)}
        >
          {workspaces?.map(
            (workspace) =>
              !workspace.selected && (
                <div className="flex justify-between gap-x-1">
                  <div
                    className="w-full items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100 "
                    onClick={() => {
                      setActionStatus({ inProgress: true });
                      selectWorkspace(workspace);
                    }}
                  >
                    {workspace.name}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
      {add ? (
        <>
          <Button
            variant="danger"
            onClick={() => {
              setAdd(!add);
              setNewWorkSpaceName("");
            }}
          >
            Nah
          </Button>
          <Button variant="success" onClick={() => handleAddWorkspace()}>
            Add
          </Button>
        </>
      ) : (
        <Button
          variant="primary-outline"
          disabled={
            actionStatus.inProgress ||
            gettingWorkspaces ||
            selectingWorkspace ||
            deletingWorkspace ||
            addingWorkspace ||
            fetchingWorkspaces ||
            fetchingResources
          }
          onClick={() => {
            setAdd(!add);
            setNewWorkSpaceName("");
          }}
        >
          Add Workspace
        </Button>
      )}
    </div>
  );
}
