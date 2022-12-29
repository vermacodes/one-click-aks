import { useEffect, useState } from "react";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import Button from "../../components/Button";
import DeleteLabButton from "../../components/Lab/DeleteLabButton";
import LabCard from "../../components/Lab/LabCard";
import LoadToBuilderButton from "../../components/Lab/LoadToBuilderButton";
import ValidateLabButton from "../../components/Lab/ValidateLabButton";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import ApplyButton from "../../components/Terraform/ApplyButton";
import DestroyButton from "../../components/Terraform/DestroyButton";
import PlanButton from "../../components/Terraform/PlanButton";
import { Assignment, Lab } from "../../dataStructures";
import { useCreateAssignment } from "../../hooks/useAssignment";
import { useDeleteLab, useSharedLabs } from "../../hooks/useBlobs";
import LabBuilder from "../../modals/LabBuilder";
import ServerError from "../ServerError";

export default function Labs() {
  const [more, setMore] = useState<string>("");
  const [userAlias, setUserAlias] = useState<string>("");
  const [createdColor, setCreatedColor] = useState<boolean>(false);
  const { data: labs, isLoading, isError } = useSharedLabs();
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

  function handleShowMore(lab: Lab) {
    if (more !== lab.id) {
      setMore(lab.id);
    } else {
      setMore("");
    }
  }

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

  if (isLoading) {
    return <div className="my-3 mx-20 mb-2">Loading...</div>;
  }

  if (isError) {
    return <ServerError />;
  }

  return (
    <div className="my-3 mx-20 mb-2 overflow-x-hidden">
      <p className="my-2 border-b-2 border-slate-500 py-4 text-4xl">Labs</p>
      <div className="w-7/8 grid grid-cols-3 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {labs &&
          labs.map((lab: Lab) => (
            <TemplateCard key={lab.name}>
              <LabCard lab={lab}>
                <>
                  <div className="flex flex-col justify-between gap-2">
                    <div className="flex justify-between gap-x-4 gap-y-2">
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
                      <Button
                        variant="primary-outline"
                        onClick={() => handleShowMore(lab)}
                      >
                        <div
                          className={` ${
                            lab.id === more ? "rotate-90" : ""
                          } transition-transform duration-500`}
                        >
                          <FaArrowRight />
                        </div>
                      </Button>
                    </div>
                    <div
                      className={`${
                        lab.id === more ? "max-h-40" : "max-h-0"
                      } flex flex-wrap justify-end gap-1 gap-x-1 overflow-hidden transition-all duration-500`}
                    >
                      <PlanButton variant="success-outline" lab={lab}>
                        Plan
                      </PlanButton>
                      <ApplyButton variant="primary-outline" lab={lab}>
                        Apply
                      </ApplyButton>
                      <ValidateLabButton lab={lab} variant="primary-outline">
                        Validate
                      </ValidateLabButton>
                      <DestroyButton variant="danger-outline" lab={lab}>
                        Destroy
                      </DestroyButton>
                      <LabBuilder lab={lab} variant="secondary-outline">
                        Edit
                      </LabBuilder>
                      <LoadToBuilderButton
                        variant="secondary-outline"
                        lab={lab}
                      >
                        Load To Builder
                      </LoadToBuilderButton>
                      <DeleteLabButton lab={lab} variant="secondary-outline">
                        Delete
                      </DeleteLabButton>
                    </div>
                  </div>
                </>
              </LabCard>
            </TemplateCard>
          ))}
      </div>
      <Terminal />
    </div>
  );
}
