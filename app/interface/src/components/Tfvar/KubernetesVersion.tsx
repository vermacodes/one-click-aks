import { FaChevronDown } from "react-icons/fa";
import { Orchestrator, Value } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import { useGetOrchestrators } from "../../hooks/useOrchestrators";

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
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  function handleOnSelect(patchVersion: string) {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        lab.template.kubernetesClusters[0].kubernetesVersion = patchVersion;
        !actionStatus &&
          setLogs({
            isStreaming: false,
            logs: JSON.stringify(lab.template, null, 4),
          });
        setLab(lab);
      }
    }
  }

  if (
    lab &&
    lab.template &&
    lab.template.kubernetesClusters.length > 0 &&
    lab.template.kubernetesClusters[0].kubernetesVersion === "" &&
    data &&
    data.values
  ) {
    handleOnSelect(Object.keys(data.values[0].patchVersions)[0]);
  }

  return (
    // TODO : This is bug. if version menu is open and you also open a modal, lets say terraform settings. then version menu will be on top.
    // TODO : Fix this.
    <div className={`${versionMenu ? "relative" : ""} inline-block text-left`}>
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
        {lab &&
          lab.template &&
          lab.template.kubernetesClusters.length > 0 &&
          lab.template.kubernetesClusters[0].kubernetesVersion}
        <p>
          <FaChevronDown />
        </p>
      </div>
      <div
        className={`absolute right-0 z-10 mt-2 h-56 w-64 origin-top-right overflow-y-auto overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 ${
          !versionMenu && "hidden"
        } items-center gap-y-2 rounded border border-slate-500 bg-slate-100 p-2 dark:bg-slate-800`}
      >
        {data?.values?.map(
          (value) =>
            lab &&
            lab.template &&
            lab.template.kubernetesClusters.length > 0 &&
            lab.template?.kubernetesClusters[0].kubernetesVersion !==
              undefined && (
              <div key={value.version}>
                {Object.keys(value.patchVersions).map((patchVersion) => (
                  <div
                    key={patchVersion}
                    className="flex justify-between gap-x-1"
                  >
                    <div
                      className={`${
                        patchVersion ===
                          lab.template?.kubernetesClusters[0]
                            .kubernetesVersion &&
                        "bg-green-300 hover:text-slate-900 dark:text-slate-900"
                      } w-full items-center justify-between rounded p-2 hover:bg-sky-500 hover:text-slate-100 `}
                      onClick={() => {
                        setVersionMenu(false);
                        handleOnSelect(patchVersion);
                      }}
                    >
                      <div key={patchVersion}>{patchVersion}</div>
                      {/* <div className="justify-start">
                      <span>
                        {orchestrator.isPreview
                          ? " (Preview)"
                          : orchestrator.default
                          ? " (Default)"
                          : ""}
                      </span>
                    </div> */}

                      <div className="space-x-2 text-xs text-slate-500">
                        Upgrades :
                        {value.patchVersions[patchVersion].upgrades &&
                          value.patchVersions[patchVersion].upgrades.map(
                            (upgrade) => <span key={upgrade}> {upgrade}</span>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
        )}
      </div>
    </div>
  );
}
