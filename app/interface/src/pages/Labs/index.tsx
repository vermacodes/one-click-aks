import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import Button from "../../components/Button";
import CreateAssignment from "../../components/Lab/Assignment/CreateAssignment";
import DeleteLabButton from "../../components/Lab/DeleteLabButton";
import LabCard from "../../components/Lab/LabCard";
import LoadToBuilderButton from "../../components/Lab/LoadToBuilderButton";
import ValidateLabButton from "../../components/Lab/ValidateLabButton";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import ApplyButton from "../../components/Terraform/ApplyButton";
import DestroyButton from "../../components/Terraform/DestroyButton";
import PlanButton from "../../components/Terraform/PlanButton";
import { Lab } from "../../dataStructures";
import { useSharedLabs } from "../../hooks/useBlobs";
import LabBuilder from "../../modals/LabBuilder";
import ServerError from "../ServerError";

export default function Labs() {
  const [more, setMore] = useState<string>("");
  const { data: labs, isLoading, isFetching, isError } = useSharedLabs();

  function handleShowMore(lab: Lab) {
    if (more !== lab.id) {
      setMore(lab.id);
    } else {
      setMore("");
    }
  }

  if (isLoading || isFetching) {
    return (
      <div className="my-3 mx-20 mb-2">
        <p className="text-4xl">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return <ServerError />;
  }

  return (
    <div className="flex flex-col gap-x-4">
      <p className=" mb-6 border-b-2 border-slate-500 py-4 text-4xl">
        Readiness Labs
      </p>
      <div className="w-7/8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {labs &&
          labs.map((lab: Lab) => (
            <TemplateCard key={lab.name}>
              <LabCard lab={lab}>
                <>
                  <div className="flex flex-col justify-between gap-2">
                    <div className="flex flex-wrap justify-end gap-2">
                      <CreateAssignment lab={lab} />
                    </div>
                    <div
                      className={`${
                        lab.id === more
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-500"
                      } mt-4 flex items-center justify-between border-t border-slate-500 py-2 text-sm transition-all duration-500 hover:text-sky-500`}
                      onClick={() => handleShowMore(lab)}
                    >
                      <div>More Actions</div>
                      <div
                        className={` ${
                          lab.id === more ? "rotate-90" : ""
                        } transition-transform duration-500 `}
                      >
                        <FaArrowRight />
                      </div>
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
                        Deploy
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
