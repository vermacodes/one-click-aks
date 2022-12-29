import { useEffect, useState } from "react";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { Assignment, Lab } from "../../../../dataStructures";
import { useCreateAssignment } from "../../../../hooks/useAssignment";
import Button from "../../../Button";

type Props = {
  lab: Lab;
};

export default function CreateAssignment({ lab }: Props) {
  const [userAlias, setUserAlias] = useState<string>("");
  const [createdColor, setCreatedColor] = useState<boolean>(false);
  const {
    mutate: createAssignment,
    isLoading: creating,
    data: createData,
  } = useCreateAssignment();

  useEffect(() => {
    if (createData?.status === 201) {
      setCreatedColor(true);
      setTimeout(() => {
        setCreatedColor(false);
      }, 3000);
    }
  }, [createData]);

  function handleAssignment(lab: Lab) {
    var assignment: Assignment = {
      id: "",
      user: userAlias,
      labId: lab.id,
      labName: lab.name,
      status: "Assigned",
    };
    setUserAlias("");
    createAssignment(assignment);
  }
  return (
    <div className="flex justify-start gap-x-4 gap-y-2">
      <input
        className="w-full rounded border border-slate-500 bg-inherit px-2 py-1"
        placeholder="Enter user alias to assign lab"
        onChange={(event) => setUserAlias(event.target.value)}
        value={userAlias}
      ></input>
      <Button
        variant={createdColor ? "success" : "primary"}
        onClick={() => handleAssignment(lab)}
        disabled={creating}
      >
        <div className="flex items-center justify-center gap-x-2">
          {createdColor ? (
            <>
              <FaCheck /> Assigned
            </>
          ) : (
            <>
              {creating ? (
                "Assigning.."
              ) : (
                <>
                  Assign <FaArrowRight />
                </>
              )}
            </>
          )}
        </div>
      </Button>
    </div>
  );
}
