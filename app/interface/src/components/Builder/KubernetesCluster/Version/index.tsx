import { FaChevronDown } from "react-icons/fa";
import { useLab, useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGetOrchestrators } from "../../../../hooks/useOrchestrators";
import { useContext } from "react";
import { WebSocketContext } from "../../../../WebSocketContext";
import { PatchVersions, Value } from "../../../../dataStructures";

type Props = {
  versionMenu: boolean;
  setVersionMenu(args: boolean): void;
  index: number;
};

export default function Version({ versionMenu, setVersionMenu, index }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { data, isLoading, isFetching } = useGetOrchestrators();
  const { mutate: setLogs } = useSetLogs();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();

  // Select a version
  const handleOnSelect = (patchVersion: string) => {
    if (lab?.template) {
      lab.template.kubernetesClusters[index].kubernetesVersion = patchVersion;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab.template, null, 4) });
      setLab(lab);
      console.log("version selected", patchVersion);
    }
  };

  // If no version is selected, select the highest patch version of the second from top minor version
  // Omit the version if it's in preview
  if (
    lab?.template?.kubernetesClusters[index]?.kubernetesVersion === "" &&
    data?.values
  ) {
    // Filter out preview versions
    const nonPreviewValues = data.values.filter((value) => !value.isPreview);

    // Sort the versions in descending order
    nonPreviewValues.sort((a, b) => b.version.localeCompare(a.version));

    // Select the second from top minor version
    const secondTopMinorVersion = nonPreviewValues[1];

    if (secondTopMinorVersion) {
      // Get the patch versions of the selected minor version
      const patchVersions = Object.keys(secondTopMinorVersion.patchVersions);

      // Sort the patch versions in descending order
      patchVersions.sort((a, b) => b.localeCompare(a));

      // Select the highest patch version
      const highestPatchVersion = patchVersions[0];

      handleOnSelect(highestPatchVersion);
    }
  }

  // Determine if the version menu should be disabled
  const disabled =
    actionStatus.inProgress ||
    isLoading ||
    isFetching ||
    labIsLoading ||
    labIsFetching ||
    !lab?.template?.kubernetesClusters[index];

  // Determine the current version
  const currentVersion =
    lab?.template?.kubernetesClusters[index]?.kubernetesVersion;

  return (
    <div className={`${versionMenu ? "relative" : ""} inline-block text-left`}>
      <div
        className={`${
          disabled && "text-slate-500"
        } flex w-64 items-center justify-between rounded border border-slate-500 px-2 py-1`}
        onClick={(e) => {
          if (!disabled) {
            setVersionMenu(!versionMenu);
          }
          e.stopPropagation();
        }}
      >
        {currentVersion}
        <p>
          <FaChevronDown />
        </p>
      </div>
      {versionMenu && (
        <div
          className="absolute right-0 z-10 mt-2 h-56 w-64 origin-top-right items-center gap-y-2 overflow-y-auto  rounded border border-slate-500 bg-slate-100 p-2 overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-400 dark:bg-slate-800 dark:scrollbar-thumb-slate-600"
          onMouseLeave={() => setVersionMenu(false)}
        >
          {sortValues(data?.values)?.map(
            (value) =>
              currentVersion !== undefined && (
                <div key={value.version}>
                  {Object.keys(value.patchVersions).map((patchVersion) => (
                    <div
                      key={patchVersion}
                      className="flex justify-between gap-x-1"
                    >
                      <div
                        className={`${
                          patchVersion === currentVersion &&
                          "bg-green-300 hover:text-slate-900 dark:text-slate-900"
                        } w-full items-center justify-between rounded p-2 hover:bg-sky-500 hover:text-slate-100 `}
                        onClick={() => {
                          setVersionMenu(false);
                          handleOnSelect(patchVersion);
                        }}
                      >
                        <div className="flex justify-between">
                          <div key={patchVersion}>{patchVersion}</div>
                          <span>{value.isPreview && "(Preview)"}</span>
                        </div>
                        <div className="space-x-2 text-xs text-slate-500">
                          Upgrades :
                          {value.patchVersions[patchVersion].upgrades?.map(
                            (upgrade) => (
                              <span key={upgrade}> {upgrade}</span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compare two version strings.
 * @param {string} a - The first version string.
 * @param {string} b - The second version string.
 * @return {number} -1 if a > b, 1 if a < b, and 0 if a == b.
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < aParts.length; i++) {
    if (aParts[i] > bParts[i]) return -1;
    if (aParts[i] < bParts[i]) return 1;
  }

  return 0;
}

/**
 * Sort an array of values based on the version and patchVersions.
 * @param {Value[] | undefined} values - The array of values to sort.
 * @return {Value[]} The sorted array of values.
 */
function sortValues(values: Value[] | undefined): Value[] {
  if (values === undefined) return [];

  const sortedValues = [...values].sort((a, b) =>
    compareVersions(a.version, b.version)
  );

  for (const value of sortedValues) {
    value.patchVersions = Object.keys(value.patchVersions)
      .sort(compareVersions)
      .reduce((obj: PatchVersions, key) => {
        obj[key] = value.patchVersions[key];
        return obj;
      }, {});
  }

  return sortedValues;
}
