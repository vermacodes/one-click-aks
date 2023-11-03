import { Assignment } from "../../../../dataStructures";
import { useDeleteAssignment } from "../../../../hooks/useAssignment";
import Button from "../../../UserInterfaceComponents/Button";

type Props = {
  assignment: Assignment;
};

export default function DeleteAssignment({ assignment }: Props) {
  const deleteAssignment = useDeleteAssignment();
  return (
    <Button
      variant="danger-outline"
      onClick={() => deleteAssignment.mutate(assignment)}
    >
      Delete
    </Button>
  );
}
