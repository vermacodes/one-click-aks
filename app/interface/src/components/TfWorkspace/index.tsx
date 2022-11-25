import { useState } from "react";
import { FaChevronDown, FaTrash } from "react-icons/fa";
import {
  useAddWorkspace,
  useDeleteWorkspace,
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../hooks/useTfActions";

type TfWorkspaceProps = {
  workspaceMenu: boolean;
  setWorkspaceMenu(args: boolean): void;
};

export default function TfWorkspace({
  workspaceMenu,
  setWorkspaceMenu,
}: TfWorkspaceProps) {
  const [add, setAdd] = useState<boolean>(false);
  const [newWorkSpaceName, setNewWorkSpaceName] = useState<string>("");
  const { data: workspaces, isLoading: gettingWorkspaces } =
    useTerraformWorkspace();
  const { mutate: selectWorkspace } = useSelectWorkspace();
  const { mutate: deleteWorkspace } = useDeleteWorkspace();
  const { mutate: addWorkspace } = useAddWorkspace();

  function handleAddWorkspace(event: React.ChangeEvent<HTMLInputElement>) {
    setNewWorkSpaceName(event.target.value);
  }

  return (
    <div className="w-100 flex items-center justify-between space-x-2 space-x-reverse py-2">
      <h2 className="text-lg">Workspaces</h2>
      <div className="flex space-x-4">
        <div className="relative inline-block text-left">
          <div
            className={` ${
              add && "hidden"
            } flex w-96 items-center justify-between rounded border border-slate-500 p-2`}
            onClick={(e) => {
              setWorkspaceMenu(!workspaceMenu);
              e.stopPropagation();
            }}
          >
            {gettingWorkspaces ? (
              <p>Loading...</p>
            ) : (
              <>
                {workspaces?.map(
                  (workspace) => workspace.selected && <p>{workspace.name}</p>
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
              onChange={handleAddWorkspace}
            ></input>
          </div>
          <div
            className={`scrollbar absolute right-0 mt-2 h-56 w-96 origin-top-right overflow-y-auto overflow-x-hidden ${
              !workspaceMenu && "hidden"
            } items-center space-y-2 rounded border border-slate-500 bg-slate-100 p-2 dark:bg-slate-800`}
          >
            {workspaces?.map(
              (workspace) =>
                !workspace.selected && (
                  <div className="flex justify-between space-x-1">
                    <div
                      className="w-full items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100 "
                      onClick={() => selectWorkspace(workspace)}
                    >
                      {workspace.name}
                    </div>
                    {workspace.name !== "default" && (
                      <button
                        className="items-center rounded py-2 px-4 hover:bg-red-500 hover:text-slate-100 disabled:hover:bg-slate-500"
                        onClick={() => deleteWorkspace(workspace)}
                        disabled={workspace.name === "default"}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
        {add && (
          <button
            className={`rounded border border-red-700 py-2 px-4 hover:bg-red-700 hover:text-slate-100 ${
              add && "bg-red-500 text-slate-100"
            }`}
            onClick={() => {
              setAdd(!add);
              setNewWorkSpaceName("");
            }}
          >
            Nah.
          </button>
        )}
        <button
          className={`rounded border py-2 px-4  hover:text-slate-100 ${
            add
              ? "border-green-700 bg-green-500 text-slate-100 hover:bg-green-700"
              : "border-slate-500 hover:border-sky-500 hover:bg-sky-500"
          }`}
          onClick={() => {
            add && addWorkspace({ name: newWorkSpaceName, selected: true });
            setAdd(!add);
            setNewWorkSpaceName("");
          }}
        >
          {add ? "Add" : "Add Workspace"}
        </button>
      </div>
    </div>
  );
}
