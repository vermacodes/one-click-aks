import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import { Lab, TfvarConfigType } from "../../dataStructures";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useDeleteLab, useSharedMockCases } from "../../hooks/useBlobs";
import { useSetLogs } from "../../hooks/useLogs";
import LabBuilder from "../../modals/LabBuilder";
import { axiosInstance } from "../../utils/axios-interceptors";

export default function MockCases() {
  const [more, setMore] = useState<string>("");
  const { data: labs, isLoading, isError } = useSharedMockCases();

  const { data: inProgress } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const { mutate: deleteLab } = useDeleteLab();

  const navigate = useNavigate();

  var tfvar: TfvarConfigType;

  function handleShowMore(lab: Lab) {
    if (more !== lab.id) {
      setMore(lab.id);
    } else {
      setMore("");
    }
  }

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

  if (isLoading) {
    return (
      <div className="my-3 mx-20 mb-2 flex gap-x-4">
        <p className="text-4xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="my-3 mx-20 mb-2 flex flex-col gap-x-4">
      <p className="my-2 mb-6 border-b-2 border-slate-500 py-4 text-4xl">
        Mock Cases
      </p>
      <div className="w-7/8 grid grid-cols-3 gap-4">
        {labs !== undefined &&
          labs.map((lab: Lab) => (
            <TemplateCard key={lab.name}>
              <div className="flex h-full flex-col justify-between gap-y-4">
                <p className="break-all border-b border-slate-500 py-2 text-xl">
                  {lab.name}
                </p>
                <p className="break-all text-sm">{lab.description}</p>
                <div className="flex flex-auto space-x-1 border-b border-slate-500 pb-4">
                  {lab.tags &&
                    lab.tags.map((tag) => (
                      <span className="border border-slate-500 px-3 text-xs">
                        {tag}
                      </span>
                    ))}
                </div>
                <div className="flex flex-row justify-end gap-1">
                  <Button
                    variant="primary-outline"
                    onClick={() => handleTerraformAction(lab, "apply")}
                    disabled={inProgress}
                  >
                    Deploy
                  </Button>
                  <Button
                    variant="secondary-outline"
                    onClick={() => handleLabAction(lab, "extend")}
                    disabled={inProgress}
                  >
                    Extend
                  </Button>
                  <Button
                    variant="danger-outline"
                    onClick={() => handleTerraformAction(lab, "destroy")}
                    disabled={inProgress}
                  >
                    Destroy
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
                  <Button
                    variant="success-outline"
                    onClick={() => handleLabAction(lab, "validate")}
                    disabled={inProgress}
                  >
                    Validate
                  </Button>
                  <Button
                    variant="danger-outline"
                    onClick={() => deleteLab(lab)}
                  >
                    Delete
                  </Button>
                  <LabBuilder lab={lab} variant="secondary-outline">
                    Edit
                  </LabBuilder>
                </div>
              </div>
            </TemplateCard>
          ))}
      </div>
      <Terminal />
    </div>
  );
}
