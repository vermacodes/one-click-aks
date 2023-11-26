import { useState } from "react";
import Button from "../../../../UserInterfaceComponents/Button";
import Container from "../../../../UserInterfaceComponents/Container";
import { BulkAssignment, Lab } from "../../../../../dataStructures";
import { useCreateAssignments } from "../../../../../hooks/useAssignment";
import { toast } from "react-toastify";
import { useQueryClient } from "react-query";
import SelectLabsDropdown from "../SelectLabsDropdown";
import SelectUsersDropdown from "../SelectUsersDropdown";

export default function CreateAssignmentContainer() {
  const { mutateAsync: createBulkAssignments } = useCreateAssignments();
  const queryClient = useQueryClient();

  const [selectedLabs, setSelectedLabs] = useState<Lab[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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

  return (
    <Container title="Create Assignment">
      <div className="mb-4 flex w-full flex-col justify-between gap-4 bg-slate-50 dark:bg-slate-900 md:flex-row">
        <SelectLabsDropdown
          selectedLabs={selectedLabs}
          setSelectedLabs={setSelectedLabs}
        />
        <SelectUsersDropdown
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />
        <div className="flex">
          <Button variant="primary-outline" onClick={onAssignClick}>
            Assign
          </Button>
        </div>
      </div>
    </Container>
  );
}
