import { useEffect, useState } from "react";
import { FaTimes, FaUser } from "react-icons/fa";
import { Profile } from "../../../../../dataStructures";
import { useGetAllProfilesRedacted } from "../../../../../hooks/useProfile";
import DropdownSelect from "../../../../UserInterfaceComponents/DropdownSelect";
import FilterTextBox from "../../../../UserInterfaceComponents/FilterTextBox";

type Props = {
  selectedProfiles: Profile[];
  setSelectedProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  noShowProfiles?: Profile[]; // Profiles that should not be shown in the dropdown.
};

export default function SelectProfilesDropdown({
  selectedProfiles,
  setSelectedProfiles,
  noShowProfiles,
}: Props) {
  //const [uniqueProfiles, setUniqueProfiles] = useState<string[]>([]);
  const [uniqueProfiles, setUniqueProfiles] = useState<Profile[]>([]);
  const [profileSearchTerm, setProfileSearchTerm] = useState<string>("");
  const {
    data: profiles,
    isLoading: profilesLoading,
    isFetching: profilesFetching,
  } = useGetAllProfilesRedacted();

  /**
   * Effect hook to update the list of unique profiles.
   *
   * This hook runs whenever the `profiles` prop changes. It creates a new Set from the
   * current list of unique profiles, then iterates over the `profiles` array and adds each
   * profilePrincipal to the Set. If the size of the Set has changed (indicating that new
   * unique profiles were added), it updates the `uniqueProfiles` state with the new Set.
   */
  useEffect(() => {
    if (profiles) {
      const uniqueProfileSet = new Set(uniqueProfiles);
      profiles.forEach((profile) => {
        uniqueProfileSet.add(profile);
      });
      if (uniqueProfiles.length !== uniqueProfileSet.size) {
        setUniqueProfiles([...uniqueProfileSet]);
      }
    }
  }, [profiles]);

  /**
   * Function to render a search input field.
   *
   * @returns JSX.Element - The rendered search input field.
   */
  const profileSearchInput = () => {
    return (
      <div className="relative">
        <FilterTextBox
          placeHolderText="Filter by name or alias"
          value={profileSearchTerm}
          onChange={(value: string) => setProfileSearchTerm(value)}
        />
        {profileSearchTerm && (
          <FaTimes
            className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer"
            onClick={() => setProfileSearchTerm("")}
          />
        )}
      </div>
    );
  };

  /**
   * Function to handle the click event on a profile.
   *
   * @param profile - The profile that was clicked.
   */
  const onUserClick = (profile: Profile) => {
    setSelectedProfiles((selectedProfiles) =>
      selectedProfiles.includes(profile)
        ? selectedProfiles.filter((i) => i !== profile)
        : [...selectedProfiles, profile]
    );
  };

  /**
   * Function to render a profile.
   *
   * @param profile - The profile to render.
   * @returns JSX.Element - The rendered profile.
   */
  const renderUser = (profile: Profile) => {
    const isSelected = selectedProfiles.includes(profile);
    return (
      <div
        className={`relative ${
          isSelected
            ? "bg-green-500 bg-opacity-25 hover:bg-green-500 hover:bg-opacity-40 "
            : "hover:bg-sky-500 hover:bg-opacity-25 "
        } rounded `}
      >
        <div className="mt-1 cursor-pointer rounded p-2 hover:bg-opacity-40">
          <div className="flex h-fit items-center gap-2">
            <span>
              {profile.profilePhoto === "" ? (
                <div className="flex h-12 max-h-12 w-12 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-900">
                  <FaUser />
                </div>
              ) : (
                <img
                  className="h-full max-h-12 rounded-full"
                  src={profile.profilePhoto}
                  alt="Profile Picture"
                />
              )}
            </span>
            <div className="flex flex-col">
              <span>{profile.displayName}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {profile.userPrincipal}
              </span>
            </div>
          </div>
        </div>
        {isSelected && (
          <FaTimes className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer" />
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full">
      <DropdownSelect
        heading={
          selectedProfiles.length > 0
            ? selectedProfiles.length + " users selected."
            : "Select Users"
        }
        disabled={profilesLoading || profilesFetching}
        items={[
          ...selectedProfiles,
          ...uniqueProfiles
            .filter((profile) => !selectedProfiles.includes(profile))
            .filter((profile) => !noShowProfiles?.includes(profile))
            .filter((profile) =>
              JSON.stringify(profile)
                .toLowerCase()
                .includes(profileSearchTerm.toLowerCase())
            ),
        ]}
        renderItem={renderUser}
        onItemClick={onUserClick}
        search={profileSearchInput()}
        height={"h-96"}
        closeMenuOnSelect={false}
      />
    </div>
  );
}
