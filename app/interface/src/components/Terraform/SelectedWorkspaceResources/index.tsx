import { useContext } from "react";
import {
  useGetResources,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import { WebSocketContext } from "../../Context/WebSocketContext";

type Props = {};

export default function SelectedWorkspaceResources({}: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { data: resources, isFetching: fetchingResources } = useGetResources();
  const { isFetching: fetchingWorkspaces, isLoading: gettingWorkspaces } =
    useTerraformWorkspace();

  return (
    <div className="w-full justify-between gap-y-4 rounded border border-slate-500 py-2">
      <div className="h-48 rounded px-2 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 scrollbar-track-rounded-full scrollbar-thumb-rounded-full dark:scrollbar-thumb-slate-600">
        {fetchingResources || gettingWorkspaces || fetchingWorkspaces ? (
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
    </div>
  );
}
