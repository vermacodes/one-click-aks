import { useEffect, useState } from "react";
import DropdownSelect from "../../../UserInterfaceComponents/DropdownSelect";
import Button from "../../../UserInterfaceComponents/Button";
import { useGetAllRoles } from "../../../../hooks/useAuth";
import { useGetLabs } from "../../../../hooks/useGetLabs";
import { FaTimes } from "react-icons/fa";

export default function CreateAssignmentNew() {
  const { getLabsByType } = useGetLabs();
  const {
    labs,
    isLoading: labsLoading,
    isFetching: labsFetching,
  } = getLabsByType({ labType: "readinesslab" });
  const {
    data: roles,
    isLoading: rolesLoading,
    isFetching: rolesFetching,
  } = useGetAllRoles();
  const [uniqueLabNames, setUniqueLabNames] = useState<string[]>([]);
  const [labsSearchTerm, setLabsSearchTerm] = useState<string>("");
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);

  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [usersSearchTerm, setUsersSearchTerm] = useState<string>("");

  useEffect(() => {
    document.title = "ACT Labs | Assignments";
    if (labs) {
      const uniqueLabNamesSet = new Set(uniqueLabNames);
      labs.forEach((lab) => {
        uniqueLabNamesSet.add(lab.name);
      });
      if (uniqueLabNames.length !== uniqueLabNamesSet.size) {
        setUniqueLabNames([...uniqueLabNamesSet]);
      }
    }
    if (roles) {
      const uniqueUserSet = new Set(uniqueUsers);
      roles.forEach((role) => {
        uniqueUserSet.add(role.userPrincipal);
      });
      if (uniqueUsers.length !== uniqueUserSet.size) {
        setUniqueUsers([...uniqueUserSet]);
      }
    }
  }, [labs, uniqueLabNames, roles, uniqueUsers]);

  /**
   * Function to render a search input field.
   *
   * @returns JSX.Element - The rendered search input field.
   */
  const labSearchInput = () => {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={labsSearchTerm}
          onChange={(e) => setLabsSearchTerm(e.target.value)}
          className="w-full rounded px-2 py-1 dark:bg-slate-700 dark:text-slate-100"
        />
        {labsSearchTerm && (
          <FaTimes
            className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer"
            onClick={() => setLabsSearchTerm("")}
          />
        )}
      </div>
    );
  };

  const onLabClick = (item: string) => {
    //if item is not in selectedLabs, add it, else, remove it
    selectedLabs.includes(item)
      ? setSelectedLabs(selectedLabs.filter((i) => i !== item))
      : setSelectedLabs([...selectedLabs, item]);
  };

  const renderLab = (item: string) => {
    if (selectedLabs.includes(item)) {
      return (
        <div className="relative">
          <p className="mt-1 cursor-pointer rounded bg-green-500 bg-opacity-25 p-2 hover:bg-opacity-40">
            {item}
          </p>
          <FaTimes className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer" />
        </div>
      );
    }
    return (
      <p className="mt-1 cursor-pointer rounded p-2 hover:bg-sky-500 hover:bg-opacity-25">
        {item}
      </p>
    );
  };

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

  const onUserClick = (item: string) => {
    //if item is not in selectedUsers, add it, else, remove it
    selectedUsers.includes(item)
      ? setSelectedUsers(selectedUsers.filter((i) => i !== item))
      : setSelectedUsers([...selectedUsers, item]);
  };

  const renderUser = (item: string) => {
    if (selectedUsers.includes(item)) {
      return (
        <div className="relative">
          <p className="mt-1 cursor-pointer rounded bg-green-500 bg-opacity-25 p-2 hover:bg-opacity-40">
            {item}
          </p>
          <FaTimes className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer" />
        </div>
      );
    }
    return (
      <p className="mt-1 cursor-pointer rounded p-2 hover:bg-sky-500 hover:bg-opacity-25">
        {item}
      </p>
    );
  };

  return (
    <div className="mb-4 flex w-full justify-between gap-4 rounded bg-slate-50 p-2 shadow dark:bg-slate-900">
      <div className="flex w-full">
        <DropdownSelect
          heading={
            selectedLabs.length > 0
              ? selectedLabs.length + " labs selected."
              : "Select Labs"
          }
          disabled={labsLoading || labsFetching}
          items={[
            ...selectedLabs,
            ...uniqueLabNames
              .filter((lab) => !selectedLabs.includes(lab))
              .filter((lab) =>
                lab.toLowerCase().includes(labsSearchTerm.toLowerCase())
              ),
          ]}
          renderItem={renderLab}
          onItemClick={onLabClick}
          search={labSearchInput()}
          height={"h-96"}
          closeMenuOnSelect={false}
        />
      </div>
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
      <div className="flex">
        <Button variant="primary-outline">Assign</Button>
      </div>
    </div>
  );
}
