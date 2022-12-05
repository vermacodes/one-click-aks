import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Orchestrator } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useGetOrchestrators } from "../../hooks/useOrchestrators";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";

type Props = {
  versionMenu: boolean;
  setVersionMenu(args: boolean): void;
};

export default function KubernetesVersion({
  versionMenu,
  setVersionMenu,
}: Props) {
  const { data: actionStatus } = useActionStatus();
  const { data, isLoading, isFetching, isError } = useGetOrchestrators();
  const { data: tfvar } = useTfvar();
  const { mutate: setTfVar } = useSetTfvar();
  const { mutate: setLogs } = useSetLogs();

  function handleOnSelect(orchestrator: Orchestrator) {
    if (tfvar !== undefined) {
      tfvar.kubernetesCluster.kubernetesVersion =
        orchestrator.orchestratorVersion;
      !actionStatus &&
        setLogs({ isStreaming: false, logs: JSON.stringify(tfvar, null, 4) });
      setTfVar(tfvar);
    }
  }

  return (
    <div className="relative inline-block text-left">
      <div
        className={`${
          (actionStatus || isLoading || isFetching) && "text-slate-500"
        } flex w-64 items-center justify-between rounded border border-slate-500 px-2 py-1`}
        onClick={(e) => {
          if (!(actionStatus || isLoading || isFetching)) {
            setVersionMenu(!versionMenu);
          }
          e.stopPropagation();
        }}
      >
        {tfvar && tfvar.kubernetesCluster.kubernetesVersion}
        <p>
          <FaChevronDown />
        </p>
      </div>
      <div
        className={`absolute right-0 mt-2 h-56 w-64 origin-top-right overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 ${
          !versionMenu && "hidden"
        } items-center gap-y-2 rounded border border-slate-500 bg-slate-100 p-2 dark:bg-slate-800`}
      >
        {data?.orchestrators?.map(
          (orchestrator) =>
            tfvar &&
            tfvar?.kubernetesCluster.kubernetesVersion !== undefined && (
              <div className="flex justify-between gap-x-1">
                <div
                  className={`${
                    orchestrator.orchestratorVersion ===
                      tfvar?.kubernetesCluster.kubernetesVersion &&
                    "bg-green-300 hover:text-slate-900 dark:text-slate-900"
                  } w-full items-center justify-between rounded p-2 hover:bg-sky-500 hover:text-slate-100 `}
                  onClick={() => {
                    setVersionMenu(false);
                    handleOnSelect(orchestrator);
                  }}
                >
                  <div className={`flex w-full justify-between`}>
                    {orchestrator.orchestratorVersion}
                    <div className="justify-start">
                      <span>
                        {orchestrator.isPreview
                          ? " (Preview)"
                          : orchestrator.default
                          ? " (Default)"
                          : ""}
                      </span>
                    </div>
                  </div>
                  <div className="space-x-2 text-xs text-slate-500">
                    Upgrades :
                    {orchestrator.upgrades &&
                      orchestrator.upgrades.map((upgrade) => (
                        <span> {upgrade.orchestratorVersion}</span>
                      ))}
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
