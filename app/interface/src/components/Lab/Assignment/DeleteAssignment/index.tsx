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
    toast.promise(deleteAssignment(assignment), {
      pending: "Deleting Assignment...",
      success: "Assignment Deleted.",
      error: {
        render(data: any) {
          return `Failed to delete assignment. ${data.data.data}`;
        },
      },
    });
  }
  return (
    <Button
      variant="danger-outline"
      onClick={() => handleDeleteAssignment(assignment)}
    >
      🗑️ Delete
    </Button>
  );
}
