import { FaTimes } from "react-icons/fa";
import { PatchVersions } from "../../../../dataStructures";
import { useGetPatchVersions } from "../../../../hooks/useGetPatchVersions";
import { useGlobalStateContext } from "../../../Context/GlobalStateContext";
import DropdownSelect from "../../../UserInterfaceComponents/DropdownSelect";

type Props = {
  index: number;
};

export default function Version({ index }: Props) {
  const {
    patchVersions,
    searchTerm,
    setSearchTerm,
    isLoading,
    isFetching,
    handleOnSelect,
  } = useGetPatchVersions(index);

  const { lab } = useGlobalStateContext();

  if (!lab?.template?.kubernetesClusters[index]) {
    return null;
  }

  // Determine if the version menu should be disabled
  const disabled = isLoading || isFetching;

  // Determine the current version
  const currentVersion =
    lab?.template?.kubernetesClusters[index]?.kubernetesVersion;

  /**
   * Function to render a search input field.
   *
   * @returns JSX.Element - The rendered search input field.
   */
  const renderSearchInput = () => {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded px-2 py-1 dark:bg-slate-700 dark:text-slate-100"
        />
        {searchTerm && (
          <FaTimes
            className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer"
            onClick={() => setSearchTerm("")}
          />
        )}
      </div>
    );
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
        search={renderSearchInput()}
        items={patchVersions}
        onItemClick={handleOnSelect}
        renderItem={renderItem}
        width={"full"}
        height={"h-60"}
      />
    </div>
  );
}
