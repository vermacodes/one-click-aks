import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Assignment } from "../../../../dataStructures";
import { useDeleteAssignment } from "../../../../hooks/useAssignment";
import Button from "../../../UserInterfaceComponents/Button";

type Props = {
  assignment: Assignment;
};

export default function DeleteAssignment({ assignment }: Props) {
  const { mutateAsync: deleteAssignment } = useDeleteAssignment();

  function handleDeleteAssignment(assignment: Assignment) {
    let assignmentIds: string[] = [];
    assignmentIds.push(assignment.assignmentId);

    toast.promise(deleteAssignment(assignmentIds), {
      pending: "Deleting Assignment...",
      success: "Assignment Deleted.",
      error: {
        render(data: any) {
          return `Failed to delete assignment. ${data.data.response.data.error}`;
        },
      },
    });
  }
  return (
    <Button
      variant="danger-text"
      onClick={() => handleDeleteAssignment(assignment)}
    >
      <FaTrash /> Delete
    </Button>
  );
}
