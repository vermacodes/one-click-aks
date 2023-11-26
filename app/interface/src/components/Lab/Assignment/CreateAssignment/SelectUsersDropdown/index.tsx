import { useEffect, useState } from "react";
import DropdownSelect from "../../../../UserInterfaceComponents/DropdownSelect";
import { useGetAllRoles } from "../../../../../hooks/useAuth";
import { FaTimes } from "react-icons/fa";

type Props = {
  selectedUsers: string[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function SelectUsersDropdown({
  selectedUsers,
  setSelectedUsers,
}: Props) {
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);
  const [usersSearchTerm, setUsersSearchTerm] = useState<string>("");
  const {
    data: roles,
    isLoading: rolesLoading,
    isFetching: rolesFetching,
  } = useGetAllRoles();

  /**
   * Effect hook to update the list of unique users.
   *
   * This hook runs whenever the `roles` prop changes. It creates a new Set from the
   * current list of unique users, then iterates over the `roles` array and adds each
   * userPrincipal to the Set. If the size of the Set has changed (indicating that new
   * unique users were added), it updates the `uniqueUsers` state with the new Set.
   */
  useEffect(() => {
    if (roles) {
      const uniqueUserSet = new Set(uniqueUsers);
      roles.forEach((role) => {
        uniqueUserSet.add(role.userPrincipal);
      });
      if (uniqueUsers.length !== uniqueUserSet.size) {
        setUniqueUsers([...uniqueUserSet]);
      }
    }
  }, [roles]);

  /**
   * Function to render a search input field.
   *
   * @returns JSX.Element - The rendered search input field.
   */
  const userSearchInput = () => {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={usersSearchTerm}
          onChange={(e) => setUsersSearchTerm(e.target.value)}
          className="w-full rounded px-2 py-1 dark:bg-slate-700 dark:text-slate-100"
        />
        {usersSearchTerm && (
          <FaTimes
            className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer"
            onClick={() => setUsersSearchTerm("")}
          />
        )}
      </div>
    );
  };

  /**
   * Function to handle the click event on a user.
   *
   * @param user - The user that was clicked.
   */
  const onUserClick = (user: string) => {
    setSelectedUsers((selectedUsers) =>
      selectedUsers.includes(user)
        ? selectedUsers.filter((i) => i !== user)
        : [...selectedUsers, user]
    );
  };

  /**
   * Function to render a user.
   *
   * @param user - The user to render.
   * @returns JSX.Element - The rendered user.
   */
  const renderUser = (user: string) => {
    const isSelected = selectedUsers.includes(user);
    return (
      <div
        className={`relative ${
          isSelected
            ? "bg-green-500 bg-opacity-25 hover:bg-green-500 hover:bg-opacity-40 "
            : "hover:bg-sky-500 hover:bg-opacity-25 "
        } rounded `}
      >
        <p className="mt-1 cursor-pointer rounded p-2 hover:bg-opacity-40">
          {typeof user === "string" ? user : user}
        </p>
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
          selectedUsers.length > 0
            ? selectedUsers.length + " users selected."
            : "Select Users"
        }
        disabled={rolesLoading || rolesFetching}
        items={[
          ...selectedUsers,
          ...uniqueUsers
            .filter((user) => !selectedUsers.includes(user))
            .filter((user) =>
              user.toLowerCase().includes(usersSearchTerm.toLowerCase())
            ),
        ]}
        renderItem={renderUser}
        onItemClick={onUserClick}
        search={userSearchInput()}
        height={"h-96"}
        closeMenuOnSelect={false}
      />
    </div>
  );
}
