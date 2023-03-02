import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import DeleteLabButton from "../../components/Lab/DeleteLabButton";
import ExportLabButton from "../../components/Lab/Export/ExportLabButton";
import LabCard from "../../components/Lab/LabCard";
import LoadToBuilderButton from "../../components/Lab/LoadToBuilderButton";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import ApplyButton from "../../components/Terraform/ApplyButton";
import DestroyButton from "../../components/Terraform/DestroyButton";
import PlanButton from "../../components/Terraform/PlanButton";
import { Lab } from "../../dataStructures";
import { useSharedMockCases } from "../../hooks/useBlobs";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";
import LabBuilder from "../../modals/LabBuilder";

export default function MockCases() {
  const [more, setMore] = useState<string>("");
  const { data: labs, isLoading, isFetching } = useSharedMockCases();

  function handleShowMore(lab: Lab) {
    if (more !== lab.id) {
      setMore(lab.id);
    } else {
      setMore("");
    }
  }

  if (isLoading || isFetching) {
    return (
      <PageLayout heading="Mock Cases">
        <p className="text-4xl">Loading...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading="Mock Cases">
      <LabGridLayout>
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
                    <ExportLabButton lab={lab} variant="secondary-outline">
                      Export
                    </ExportLabButton>
                    <LabBuilder lab={lab} variant="secondary-outline">
                      Edit
                    </LabBuilder>
                    <LoadToBuilderButton variant="secondary-outline" lab={lab}>
                      Load To Builder
                    </LoadToBuilderButton>
                    <DeleteLabButton lab={lab} variant="danger-outline">
                      Delete
                    </DeleteLabButton>
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
