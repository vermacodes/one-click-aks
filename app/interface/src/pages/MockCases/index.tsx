import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
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
import { Lab } from "../../dataStructures";
import { useSharedMockCases } from "../../hooks/useBlobs";
import LabBuilder from "../../modals/LabBuilder";

export default function MockCases() {
  const [more, setMore] = useState<string>("");
  const { data: labs, isLoading } = useSharedMockCases();

  function handleShowMore(lab: Lab) {
    if (more !== lab.id) {
      setMore(lab.id);
    } else {
      setMore("");
    }
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
              <LabCard lab={lab}>
                <>
                  <div className="flex flex-wrap justify-end gap-1">
                    <PlanButton variant="success-outline" lab={lab}>
                      Plan
                    </PlanButton>
                    <ApplyButton variant="primary-outline" lab={lab}>
                      Deploy
                    </ApplyButton>
                    <DestroyButton variant="danger-outline" lab={lab}>
                      Destroy
                    </DestroyButton>
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
                    <ValidateLabButton lab={lab} variant="secondary-outline">
                      Validate
                    </ValidateLabButton>
                    <DeleteLabButton lab={lab} variant="danger-outline">
                      Delete
                    </DeleteLabButton>
                    <LabBuilder lab={lab} variant="secondary-outline">
                      Edit
                    </LabBuilder>
                    <LoadToBuilderButton variant="secondary-outline" lab={lab}>
                      Load To Builder
                    </LoadToBuilderButton>
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
