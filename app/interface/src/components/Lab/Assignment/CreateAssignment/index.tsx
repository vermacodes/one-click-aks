import { useEffect, useState } from "react";
import { FaArrowRight, FaCheck, FaTimes } from "react-icons/fa";
import { Assignment, Lab } from "../../../../dataStructures";
import { useCreateAssignments } from "../../../../hooks/useAssignment";
import Button from "../../../UserInterfaceComponents/Button";
import { toast } from "react-toastify";

type Props = {
  lab: Lab;
};

export default function CreateAssignment({ lab }: Props) {
  const [userAlias, setUserAlias] = useState<string>("");
  const [createdColor, setCreatedColor] = useState<boolean>(false);
  const [failedColor, setFailedColor] = useState<boolean>(false);
  const { mutateAsync: createAssignment, isLoading: creating } =
    useCreateAssignments();

  function handleAssignment(lab: Lab) {
    if (userAlias.length < 4) {
      setFailedColor(true);
      setTimeout(() => {
        setFailedColor(false);
      }, 3000);
      return;
    }

    // var assignment: Assignment = {
    //   id: "",
    //   user: userAlias,
    //   labId: lab.id,
    //   labName: lab.name,
    //   status: "Assigned",
    // };
    // setUserAlias("");

    // const createAssignmentPromise = toast.promise(
    //   createAssignment(assignment),
    //   {
    //     pending: "Creating Assignment...",
    //     success: "Assignment Created.",
    //     error: {
    //       render(data: any) {
    //         return `Failed to create assignment. ${data.data.data}`;
    //       },
    //     },
    //   }
    // );

    // createAssignmentPromise.then((response) => {
    //   if (response.status === 201) {
    //     setCreatedColor(true);
    //     setTimeout(() => {
    //       setCreatedColor(false);
    //     }, 3000);
    //   }

    //   if (response.status === undefined) {
    //     setFailedColor(true);
    //     setTimeout(() => {
    //       setFailedColor(false);
    //     }, 3000);
    //   }
    // });
  }
  return (
    <div className="flex justify-start gap-y-2">
      <input
        className="mr-4 rounded border border-slate-500 bg-inherit px-2 py-1"
        placeholder="Enter user alias"
        onChange={(event) => setUserAlias(event.target.value)}
        value={userAlias}
      ></input>
      {createdColor && (
        <Button variant={"success"}>
          <div className="flex items-center justify-center gap-x-2">
            <>
              <FaCheck /> Assigned
            </>
          </div>
        </Button>
      )}
      {failedColor && (
        <Button variant={"danger"}>
          <div className="flex items-center justify-center gap-x-2">
            <>
              <FaTimes /> Failed
            </>
          </div>
        </Button>
      )}
      {!createdColor && !failedColor && (
        <Button
          variant={"secondary"}
          onClick={() => handleAssignment(lab)}
          disabled={creating || (userAlias.length > 0 && userAlias.length < 4)}
        >
          <div className="flex items-center justify-center gap-x-2">
            {creating ? (
              "Assigning.."
            ) : (
              <>
                <FaArrowRight /> Assign
              </>
            )}
          </div>
        </Button>
      )}
    </div>
  );
}
