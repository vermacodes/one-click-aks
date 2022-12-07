import Button from "../../components/Button";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import { Lab } from "../../dataStructures";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useGetUserAssignedLabs } from "../../hooks/useAssignment";
import { useSetLogs } from "../../hooks/useLogs";
import { axiosInstance } from "../../utils/axios-interceptors";

export default function Learning() {
  const { data: labs } = useGetUserAssignedLabs();
  const { data: inProgress } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { mutate: setLogs } = useSetLogs();

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

  return (
    <div className="my-3 mx-20 mb-2">
      <h1 className="my-2 mb-6 border-b-2 border-slate-500 py-4 text-4xl">
        My Learning
      </h1>
      <div className="w-7/8 grid grid-cols-3 gap-4">
        {labs &&
          labs.map((lab) => (
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
                <div className="flex flex-wrap justify-end gap-1">
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
                    variant="success-outline"
                    onClick={() => handleLabAction(lab, "validate")}
                    disabled={inProgress}
                  >
                    Validate
                  </Button>
                  <Button
                    variant="danger-outline"
                    onClick={() => handleTerraformAction(lab, "destroy")}
                    disabled={inProgress}
                  >
                    Destroy
                  </Button>
                </div>
              </div>
            </TemplateCard>
          ))}
      </div>
      {labs?.length === 0 ? (
        <p className="text-3xl">
          Ah! No labs for you. I think you are already learned 😃
        </p>
      ) : (
        <Terminal />
      )}
    </div>
  );
}
