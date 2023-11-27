import { PatchVersions } from "../../../../dataStructures";
import { useKubernetesVersions } from "../../../../hooks/useKubernetesVersions";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../Context/GlobalStateContext";
import { useWebSocketContext } from "../../../Context/WebSocketContext";
import DropdownSelect from "../../../UserInterfaceComponents/DropdownSelect";

type Props = {
  index: number;
};

export default function Version({ index }: Props) {
  const { patchVersions, isLoading, isFetching } = useKubernetesVersions();

  const { lab, setLab } = useGlobalStateContext();
  const { actionStatus } = useWebSocketContext();
  const { mutate: setLogs } = useSetLogs();

  // Determine if the version menu should be disabled
  const disabled = isLoading || isFetching;

  // Determine the current version
  const currentVersion =
    lab?.template?.kubernetesClusters[index]?.kubernetesVersion;

  /**
   * Handles the selection of a patch version.
   *
   * @param {PatchVersions} patchVersion - The selected patch version.
   */
  const handleOnSelect = (patchVersion: PatchVersions) => {
    const patchVersionKey = Object.keys(patchVersion)[0];
    const newLab = structuredClone(lab);
    if (newLab?.template && newLab.template.kubernetesClusters[index]) {
      newLab.template.kubernetesClusters[index].kubernetesVersion =
        patchVersionKey;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(newLab.template, null, 4) });
      setLab(newLab);
    }
  };

  /**
   * Function to render an item.
   *
   * @param {PatchVersions} patchVersion - The patch version to render.
   * @returns JSX.Element - The rendered item.
   */
  const renderItem = (patchVersion: PatchVersions) => {
    const key = Object.keys(patchVersion)[0];

    // Determine the classes to apply based on whether the current version matches the key
    const classes =
      key === currentVersion
        ? "bg-green-300 hover:text-slate-900 dark:text-slate-900"
        : "";

    return (
      <div
        className={`${classes} mt-2 w-full cursor-pointer items-center justify-between gap-2 rounded p-2 hover:bg-sky-500 hover:text-slate-100`}
      >
        <div className="flex justify-between">
          <div key={key}>{key}</div>
        </div>
        <div className="space-x-2 text-xs text-slate-500">
          Upgrades :
          {patchVersion[key].upgrades?.map((upgrade) => (
            <span key={upgrade}> {upgrade}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-64">
      <DropdownSelect
        disabled={disabled}
        heading={isLoading || isFetching ? "Please wait..." : currentVersion}
        items={patchVersions}
        onItemClick={handleOnSelect}
        renderItem={renderItem}
        width={"full"}
        height={"h-60"}
      />
    </div>
  );
}
