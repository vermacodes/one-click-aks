import { useEffect, useState } from "react";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import { Assignment, BlobType, Lab } from "../../dataStructures";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useCreateAssignment } from "../../hooks/useAssignment";
import { useDeleteLab, useSharedLabs } from "../../hooks/useBlobs";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar } from "../../hooks/useTfvar";
import LabBuilder from "../../modals/LabBuilder";
import { axiosInstance } from "../../utils/axios-interceptors";
import ServerError from "../ServerError";

export default function Labs() {
  const [more, setMore] = useState<string>("");
  const [userAlias, setUserAlias] = useState<string>("");
  const [createdColor, setCreatedColor] = useState<boolean>(false);
  const { data: inProgress } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const { data: labs, isLoading, isError } = useSharedLabs();
  const { mutate: deleteLab } = useDeleteLab();
  const { mutate: setTfvar } = useSetTfvar();
  const {
    mutate: createAssignment,
    isLoading: creating,
    isSuccess: created,
    status: createStatus,
    data: createData,
  } = useCreateAssignment();

  const navigate = useNavigate();

  useEffect(() => {
    if (createData?.status === 201) {
      setCreatedColor(true);
      setTimeout(() => {
        setCreatedColor(false);
      }, 3000);
    }
  }, [createData]);

  function handleTerraformAction(lab: Lab, action: string) {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post(`${action}`, lab.template);
  }

  function handleLabAction(lab: Lab, action: string) {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post(`labs/${action}/${lab.type}/${lab.id}`);
  }

  function handleShowMore(lab: Lab) {
    console.log("Lab : ", lab);
    console.log("More : ", more);
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
              <div className="flex h-min flex-col justify-between gap-y-4 transition-transform duration-500 ease-in-out">
                <p className="break-all border-b border-slate-500 py-2 text-xl">
                  {lab.name}
                </p>
                <p className="break-all text-sm">{lab.description}</p>
                <div className="flex flex-auto space-x-1 border-b border-slate-500 pb-4">
                  {lab.tags &&
                    lab.tags.map((tag) => (
                      <span
                        className="h-5 border border-slate-500 px-3 text-xs"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
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
                  </div>
                  <Button
                    variant="primary-outline"
                    onClick={() => handleShowMore(lab)}
                  >
                    <div className="flex items-center justify-center gap-x-4">
                      More options
                      <FaArrowRight />
                    </div>
                  </Button>
                  <div
                    className={`${
                      lab.id === more ? "max-h-50" : "max-h-0"
                    } transition-transformation flex flex-col gap-1 gap-x-1 overflow-hidden duration-500`}
                  >
                    <Button
                      variant="primary-outline"
                      onClick={() => handleTerraformAction(lab, "apply")}
                      disabled={inProgress}
                    >
                      Deploy
                    </Button>
                    <Button
                      variant="secondary-outline"
                      onClick={() => handleLabAction(lab, "break")}
                      disabled={inProgress}
                    >
                      Break
                    </Button>
                    <Button
                      variant="success-outline"
                      onClick={() => handleLabAction(lab, "validate")}
                      disabled={inProgress}
                    >
                      Validate
                    </Button>
                    <LabBuilder lab={lab} variant="secondary-outline">
                      Edit
                    </LabBuilder>
                    <Button
                      variant="danger-outline"
                      onClick={() => handleTerraformAction(lab, "destroy")}
                      disabled={inProgress}
                    >
                      Destroy
                    </Button>
                    <Button
                      variant="danger-outline"
                      onClick={() => deleteLab(lab)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </TemplateCard>
          ))}
      </div>
      <Terminal />
    </div>
  );
}
