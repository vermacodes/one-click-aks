import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import CreateAssignmentContainer from "../../components/Lab/Assignment/CreateAssignment/CreateAssignmentContainer";
import DeleteAssignment from "../../components/Lab/Assignment/DeleteAssignment";
import Terminal from "../../components/Terminal";
import Button from "../../components/UserInterfaceComponents/Button";
import Checkbox from "../../components/UserInterfaceComponents/Checkbox";
import Container from "../../components/UserInterfaceComponents/Container";
import ConfirmationModal from "../../components/UserInterfaceComponents/Modal/ConfirmationModal";
import { Assignment } from "../../dataStructures";
import {
  useDeleteAssignment,
  useGetAllReadinessLabsRedacted,
  useGetAssignments,
} from "../../hooks/useAssignment";
import { useGetMyProfile } from "../../hooks/useProfile";
import PageLayout from "../../layouts/PageLayout";

type Props = {};

export default function Assignments({}: Props) {
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>(
    []
  );
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [confirmationModalOpen, setConfirmationModalOpen] =
    useState<boolean>(false);

  const { data: profile } = useGetMyProfile();
  const { data: allAssignments } = useGetAssignments();
  const { data: labs } = useGetAllReadinessLabsRedacted();
  const { mutateAsync: deleteAssignments } = useDeleteAssignment();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (allAssignments) {
      const allAssignmentsMap = new Map(
        allAssignments.map((assignment) => [
          assignment.assignmentId,
          assignment,
        ])
      );
      setAssignments(Array.from(allAssignmentsMap.values()));
    }
  }, [allAssignments]);

  function handleDeleteSelected() {
    setConfirmationModalOpen(false);
    let assignmentIds = selectedAssignments.map(
      (assignment) => assignment.assignmentId
    );

    const response = toast.promise(deleteAssignments(assignmentIds), {
      pending: "Deleting Assignments...",
      success: "Assignments Deleted.",
      error: {
        render(data: any) {
          return `Failed to delete assignments. ${data.data.response.data.error}`;
        },
      },
    });

    response
      .then(() => {
        // remove selected assignments from assignments state.
        let newAssignments = assignments.filter(
          (assignment) => !assignmentIds.includes(assignment.assignmentId)
        );
        setAssignments(newAssignments);

        // remove selected assignments from selectedAssignments state.
        setSelectedAssignments([]);
      })
      .finally(() => {
        // invalidate all lab id queries.
        selectedAssignments.forEach((assignment) => {
          queryClient.invalidateQueries([
            "get-assignments-by-lab-id",
            assignment.labId,
          ]);
          queryClient.invalidateQueries([
            "get-assignments-by-user-id",
            assignment.userId,
          ]);
          queryClient.invalidateQueries([
            "get-readiness-labs-redacted-by-user-id",
            assignment.userId,
          ]);
        });
        queryClient.invalidateQueries([
          "get-readiness-labs-redacted-by-user-id",
          "my",
        ]);
        queryClient.invalidateQueries("get-my-assignments");
        queryClient.invalidateQueries("get-assignments");
      });
  }

  function getLabName(labId: string) {
    if (labs) {
      const lab = labs.find((lab) => lab.id === labId);
      if (lab) {
        return lab.name;
      }
    }
    return "";
  }

  useEffect(() => {
    document.title = "ACT Labs | Assignments";
  }, []);

  if (!profile?.roles.includes("mentor")) {
    return (
      <PageLayout heading="Lab Assignments">
        <p className="text-xl">
          ✋ You don't have permission to access this page.
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading="Lab Assignments">
      <div className="flex flex-col gap-4">
        <CreateAssignmentContainer />
        <Container
          title="All Assignments"
          collapsible={true}
          additionalContainerBodyClasses="h-fit overflow-auto scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-200 scrollbar-track-rounded dark:scrollbar-thumb-slate-700 scrollbar-thumb-rounded dark:scrollbar-track-slate-900"
        >
          <div className="flex justify-end p-4">
            <Button
              variant="danger-outline"
              disabled={selectedAssignments.length === 0}
              onClick={() => setConfirmationModalOpen(true)}
            >
              <FaTrash /> Delete Selected
            </Button>
            {confirmationModalOpen && (
              <ConfirmationModal
                onConfirm={handleDeleteSelected}
                onClose={() => setConfirmationModalOpen(false)}
                title="Confirm Delete All Assignments"
              >
                <p className="text-xl text-slate-400">
                  Are you sure you want to delete all the selected assignments?
                  This is not reversible.
                </p>
              </ConfirmationModal>
            )}
          </div>
          <table className="h-full w-full table-auto border-separate space-x-2 overflow-auto bg-slate-50 py-2 dark:bg-slate-900">
            <thead>
              <tr key={"tableHead"}>
                <th>
                  <Checkbox
                    id={"selectAll"}
                    label=""
                    handleOnChange={
                      selectedAssignments.length === assignments?.length
                        ? () => setSelectedAssignments([])
                        : () => setSelectedAssignments(assignments || [])
                    }
                    checked={
                      selectedAssignments.length === assignments?.length &&
                      selectedAssignments.length !== 0
                    }
                    disabled={assignments?.length === 0}
                  />
                </th>
                <th className="space-x-2 px-4 py-2 text-left">Lab Name</th>
                <th className="space-x-2 px-4 py-2 text-left">User</th>
                <th className="space-x-2 px-4 py-2 text-left">Status</th>
                <th className="space-x-2 px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments &&
                assignments.map((assignment) => (
                  <tr
                    key={assignment.assignmentId + assignment.userId}
                    className="hover:bg-slate-100 hover:dark:bg-slate-800"
                  >
                    <td>
                      <Checkbox
                        id={assignment.assignmentId}
                        label=""
                        handleOnChange={
                          selectedAssignments.includes(assignment)
                            ? () =>
                                setSelectedAssignments(
                                  selectedAssignments.filter(
                                    (i) => i !== assignment
                                  )
                                )
                            : () =>
                                setSelectedAssignments([
                                  ...selectedAssignments,
                                  assignment,
                                ])
                        }
                        checked={selectedAssignments.includes(assignment)}
                      />
                    </td>
                    <td className="space-x-2 px-4 py-2">
                      {getLabName(assignment.labId)}
                    </td>
                    <td className="space-x-2 px-4 py-2">{assignment.userId}</td>
                    <td className="space-x-2 px-4 py-2">{assignment.status}</td>
                    <td className="space-x-2 px-4 py-2">
                      <DeleteAssignment assignment={assignment} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Container>
      </div>
      <Terminal />
    </PageLayout>
  );
}
