import { useState } from "react";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { BulkAssignment, Lab, Profile } from "../../../../../dataStructures";
import { useCreateAssignments } from "../../../../../hooks/useAssignment";
import Button from "../../../../UserInterfaceComponents/Button";
import Container from "../../../../UserInterfaceComponents/Container";
import SelectLabsDropdown from "../SelectLabsDropdown";
import SelectProfilesDropdown from "../SelectProfilesDropdown";

export default function CreateAssignmentContainer() {
  const { mutateAsync: createBulkAssignments } = useCreateAssignments();
  const queryClient = useQueryClient();

  const [selectedLabs, setSelectedLabs] = useState<Lab[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);

  function onAssignClick() {
    let bulkAssignments: BulkAssignment = {
      labIds: selectedLabs.map((lab) => lab.id),
      userIds: selectedProfiles.map((profile) => profile.userPrincipal),
    };

    const response = toast.promise(createBulkAssignments(bulkAssignments), {
      pending: "Creating assignments...",
      success: "Assignments created!",
      error: {
        render(data: any) {
          return `Error creating assignments. ${data.data.response.data.error}`;
        },
        autoClose: 5000,
      },
    });
    response.finally(() => {
      // invalidate all lab id queries.
      selectedLabs.forEach((lab) => {
        queryClient.invalidateQueries(["get-assignments-by-lab-id", lab.id]);
      });

      // invalidate all user id queries.
      selectedProfiles.forEach((user) => {
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
      setSelectedProfiles([]);
    });
  }

  return (
    <Container title="Create Assignment">
      <div className="mb-4 flex w-full flex-col justify-between gap-4 bg-slate-50 dark:bg-slate-900 md:flex-row">
        <SelectLabsDropdown
          selectedLabs={selectedLabs}
          setSelectedLabs={setSelectedLabs}
        />
        <SelectProfilesDropdown
          selectedProfiles={selectedProfiles}
          setSelectedProfiles={setSelectedProfiles}
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
