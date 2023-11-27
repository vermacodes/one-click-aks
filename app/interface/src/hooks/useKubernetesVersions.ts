import { useEffect, useState } from "react";
import { PatchVersions, Value } from "../dataStructures";
import { useGetOrchestrators } from "./useOrchestrators";

export function useKubernetesVersions() {
  const [patchVersions, setPatchVersions] = useState<PatchVersions[]>([]);
  const [defaultVersion, setDefaultVersion] = useState<string>("");
  const { data, isLoading, isFetching } = useGetOrchestrators();

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
          patchVersions.push({ [key]: patchVersion });
        });
      });
      setPatchVersions(patchVersions);
    }
  }, [data]);

  /**
   * This useEffect hook is triggered when `data` changes.
   * If `data.values` is defined, it sets the default version to the highest patch version
   * available in `data.values` by calling `getDefaultVersion`.
   */
  useEffect(() => {
    if (data?.values) {
      setDefaultVersion(getDefaultVersion(data.values));
    }
  }, [data]);

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
   * Selects the default patch version of the second from top minor version.
   * If no version is selected, it omits the version if it's in preview.
   *
   * @param {Value[] | undefined} values - The array of values to select from.
   * @param {string | undefined} currentVersion - The current version.
   * @param {(patchVersion: string) => void} handleOnSelect - The function to call with the selected version.
   */
  function getDefaultVersion(values: Value[]): string {
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
      return patchVersions[0];
    }
    return "";
  }

  return {
    patchVersions,
    defaultVersion,
    isLoading,
    isFetching,
  };
}
