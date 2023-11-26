import { useEffect, useState } from "react";
import { PatchVersions, Value } from "../dataStructures";
import { useGetOrchestrators } from "./useOrchestrators";
import { useLab, useSetLab } from "./useLab";
import { useWebSocketContext } from "../components/Context/WebSocketContext";
import { useSetLogs } from "./useLogs";

export function useGetPatchVersions(index: number) {
  const [patchVersions, setPatchVersions] = useState<PatchVersions[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { actionStatus } = useWebSocketContext();
  const { data, isLoading, isFetching } = useGetOrchestrators();
  const { data: lab } = useLab();
  const { mutate: setLogs } = useSetLogs();
  const { mutate: setLab } = useSetLab();

  /**
   * Effect hook to filter and set patch versions.
   *
   * This hook runs when the component mounts and whenever `data` or `searchTerm` changes.
   * If `data` is defined and contains `values`, it sorts these values and iterates over them.
   * For each value, it iterates over the entries of `patchVersions`.
   * If a key in `patchVersions` includes the `searchTerm`, a new object with that key and value is pushed into `patchVersions`.
   * Finally, it updates the state with the new `patchVersions`.
   */
  useEffect(() => {
    if (data?.values) {
      let patchVersions: PatchVersions[] = [];
      sortValues(data?.values)?.forEach((value) => {
        Object.entries(value.patchVersions).forEach(([key, patchVersion]) => {
          if (key.includes(searchTerm)) {
            patchVersions.push({ [key]: patchVersion });
          }
        });
      });
      setPatchVersions(patchVersions);
    }
  }, [data, searchTerm]);

  /**
   * Handles the selection of a patch version.
   *
   * @param {PatchVersions} patchVersion - The selected patch version.
   */
  const handleOnSelect = (patchVersion: PatchVersions) => {
    const patchVersionKey = Object.keys(patchVersion)[0];
    if (lab?.template && lab.template.kubernetesClusters[index]) {
      lab.template.kubernetesClusters[index].kubernetesVersion =
        patchVersionKey;
      !actionStatus.inProgress &&
        setLogs({ logs: JSON.stringify(lab.template, null, 4) });
      setLab(lab);
    }
  };

  /**
   * Selects the highest patch version.
   *
   * The function is called with the following parameters:
   * - The list of available versions (data?.values).
   * - The current version of the Kubernetes cluster (lab?.template?.kubernetesClusters[index]?.kubernetesVersion).
   * - The function to handle the selection of a patch version (handleOnSelect).
   */
  selectHighestPatchVersion(
    data?.values,
    lab?.template?.kubernetesClusters[index]?.kubernetesVersion,
    handleOnSelect
  );

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

  /**
   * Selects the highest patch version of the second from top minor version.
   * If no version is selected, it omits the version if it's in preview.
   *
   * @param {Value[] | undefined} values - The array of values to select from.
   * @param {string | undefined} currentVersion - The current version.
   * @param {(patchVersion: string) => void} handleOnSelect - The function to call with the selected version.
   */
  function selectHighestPatchVersion(
    values: Value[] | undefined,
    currentVersion: string | undefined,
    handleOnSelect: (patchVersion: PatchVersions) => void
  ) {
    if ((currentVersion === undefined || currentVersion === "") && values) {
      // Filter out preview versions
      const nonPreviewValues = values.filter((value) => !value.isPreview);

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

        handleOnSelect({
          [highestPatchVersion]:
            secondTopMinorVersion.patchVersions[highestPatchVersion],
        });
      }
    }
  }

  return {
    patchVersions,
    searchTerm,
    setSearchTerm,
    isLoading,
    isFetching,
    handleOnSelect,
  };
}
