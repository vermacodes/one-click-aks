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
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";
import LabBuilder from "../../modals/SaveLabModal";
import ServerError from "../ServerError";

export default function ReadinessLabs() {
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
      <PageLayout heading="Readiness Labs">
        <p className="text-4xl">Loading...</p>
      </PageLayout>
    );
  }

  if (isError) {
    return <ServerError />;
  }

  return (
    <PageLayout heading="Readiness Labs">
      <LabGridLayout>
        {labs &&
          labs.map((lab: Lab) => (
            <TemplateCard key={lab.name}>
              <LabCard lab={lab}>
                <>
                  <div className="flex w-full flex-col justify-between gap-2">
                    <div className="flex justify-between gap-2">
                      <CreateAssignment lab={lab} />
                      <div
                        className={`${
                          more === lab.id && "rotate-90"
                        } transition-all duration-500`}
                      >
                        <Button
                          variant="primary-icon"
                          onClick={() => handleShowMore(lab)}
                        >
                          <FaArrowRight />
                        </Button>
                      </div>
                    </div>
                    <div
                      className={`${
                        lab.id === more ? "max-h-40" : "max-h-0"
                      } flex flex-wrap justify-between gap-1 gap-x-1 overflow-hidden transition-all duration-500`}
                    >
                      <PlanButton variant="success-text" lab={lab}>
                        Plan
                      </PlanButton>
                      <ApplyButton variant="primary-text" lab={lab}>
                        Deploy
                      </ApplyButton>
                      <ValidateLabButton lab={lab} variant="secondary-text">
                        Validate
                      </ValidateLabButton>
                      <DestroyButton variant="danger-text" lab={lab}>
                        Destroy
                      </DestroyButton>
                      <LabBuilder lab={lab} variant="secondary-text">
                        Edit
                      </LabBuilder>
                      <LoadToBuilderButton variant="secondary-text" lab={lab}>
                        Open
                      </LoadToBuilderButton>
                      <DeleteLabButton lab={lab} variant="danger-text">
                        Delete
                      </DeleteLabButton>
                    </div>
                  </div>
                </>
              </LabCard>
            </TemplateCard>
          ))}
      </LabGridLayout>
      <Terminal />
    </PageLayout>
  );
}
