import { useEffect, useState } from "react";
import DropdownSelect from "../../../UserInterfaceComponents/DropdownSelect";
import Button from "../../../UserInterfaceComponents/Button";
import { useGetAllRoles } from "../../../../hooks/useAuth";
import { FaTimes } from "react-icons/fa";
import Container from "../../../UserInterfaceComponents/Container";
import { BulkAssignment, Lab } from "../../../../dataStructures";
import {
  useCreateAssignments,
  useGetAllReadinessLabsRedacted,
} from "../../../../hooks/useAssignment";
import { toast } from "react-toastify";
import { useQueryClient } from "react-query";

export default function CreateAssignmentNew() {
  const {
    data: labs,
    isLoading: labsLoading,
    isFetching: labsFetching,
  } = useGetAllReadinessLabsRedacted();
  const {
    data: roles,
    isLoading: rolesLoading,
    isFetching: rolesFetching,
  } = useGetAllRoles();
  const { mutateAsync: createBulkAssignments } = useCreateAssignments();
  const queryClient = useQueryClient();

  const [uniqueLabs, setUniqueLabs] = useState<Lab[]>([]);
  const [labsSearchTerm, setLabsSearchTerm] = useState<string>("");
  const [selectedLabs, setSelectedLabs] = useState<Lab[]>([]);

  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [usersSearchTerm, setUsersSearchTerm] = useState<string>("");

  useEffect(() => {
    document.title = "ACT Labs | Assignments";
    if (labs) {
      const uniqueLabsSet = new Set(uniqueLabs);
      labs.forEach((lab) => {
        uniqueLabsSet.add(lab);
      });
      if (uniqueLabs.length !== uniqueLabsSet.size) {
        setUniqueLabs([...uniqueLabsSet]);
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
  }, [labs, roles]);

  // const [
  //   uniqueLabs,
  //   selectedLabs,
  //   setSelectedLabs,
  //   onLabClick,
  //   labsSearchTerm,
  //   setLabsSearchTerm,
  // ] = useSelectionSearch(labs);
  // const [
  //   uniqueUsers,
  //   selectedUsers,
  //   setSelectedUsers,
  //   onUserClick,
  //   usersSearchTerm,
  //   setUsersSearchTerm,
  // ] = useSelectionSearch(roles);

  function onAssignClick() {
    let bulkAssignments: BulkAssignment = {
      labIds: selectedLabs.map((lab) => lab.id),
      userIds: selectedUsers,
    };

    const response = toast.promise(createBulkAssignments(bulkAssignments), {
      pending: "Creating assignments...",
      success: "Assignments created!",
      error: "Error creating assignments.",
    });
    response.finally(() => {
      // invalidate all lab id queries.
      selectedLabs.forEach((lab) => {
        queryClient.invalidateQueries(["get-assignments-by-lab-id", lab.id]);
      });

      // invalidate all user id queries.
      selectedUsers.forEach((user) => {
        queryClient.invalidateQueries(["get-assignments-by-user-id", user]);
        queryClient.invalidateQueries(["get-assignments-by-user-id", user]);
        queryClient.invalidateQueries([
          "get-readiness-labs-redacted-by-user-id",
          user,
        ]);
        queryClient.invalidateQueries([
          "get-readiness-labs-redacted-by-user-id",
          "my",
        ]);
        queryClient.invalidateQueries("get-my-assignments");
      });

      setSelectedLabs([]);
      setSelectedUsers([]);
    });
  }

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

  // Define the types for your items
  type User = string;

  // Helper function to handle selection
  const handleSelection = <T,>(
    item: T,
    selectedItems: T[],
    setSelectedItems: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setSelectedItems(
      selectedItems.includes(item)
        ? selectedItems.filter((i) => i !== item)
        : [...selectedItems, item]
    );
  };

  // Use the helper function in onLabClick and onUserClick
  const onLabClick = (item: Lab) =>
    handleSelection(item, selectedLabs, setSelectedLabs);
  const onUserClick = (item: User) =>
    handleSelection(item, selectedUsers, setSelectedUsers);

  // Simplified render function
  const renderItem = <T extends Lab | User>(item: T, selectedItems: T[]) => {
    const isSelected = selectedItems.includes(item);
    return (
      <div
        className={`relative ${
          isSelected
            ? "bg-green-500 bg-opacity-25 hover:bg-green-500 hover:bg-opacity-40 "
            : "hover:bg-sky-500 hover:bg-opacity-25 "
        } rounded `}
      >
        <p className="mt-1 cursor-pointer rounded p-2 hover:bg-opacity-40">
          {typeof item === "string" ? item : item.name}
        </p>
        {isSelected && (
          <FaTimes className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer" />
        )}
      </div>
    );
  };

  // Use the simplified render function
  const renderLab = (item: Lab) => renderItem(item, selectedLabs);
  const renderUser = (item: User) => renderItem(item, selectedUsers);

  return (
    <Container title="Create Assignment">
      <div className="mb-4 flex w-full flex-col justify-between gap-4 bg-slate-50 dark:bg-slate-900 md:flex-row">
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
              ...uniqueLabs
                .filter((lab) => !selectedLabs.includes(lab))
                .filter((lab) =>
                  lab.name.toLowerCase().includes(labsSearchTerm.toLowerCase())
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
          <Button variant="primary-outline" onClick={onAssignClick}>
            Assign
          </Button>
        </div>
      </div>
    </Container>
  );
}
