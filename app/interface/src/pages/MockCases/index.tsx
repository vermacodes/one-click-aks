import { useState } from "react";
import { FaArrowDown, FaArrowRight, FaEllipsisV } from "react-icons/fa";
import DeleteLabButton from "../../components/Lab/DeleteLabButton";
import ExportLabButton from "../../components/Lab/Export/ExportLabButton";
import LabCard from "../../components/Lab/LabCard";
import LoadToBuilderButton from "../../components/Lab/LoadToBuilderButton";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import ApplyButton from "../../components/Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../components/Terraform/ActionButtons/DestroyButton";
import PlanButton from "../../components/Terraform/ActionButtons/PlanButton";
import { Lab } from "../../dataStructures";
import { useSharedMockCases } from "../../hooks/useBlobs";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";
import Button from "../../components/UserInterfaceComponents/Button";
import SelectedDeployment from "../../components/Deployments/SelectedDeployment";
import SaveLabButton from "../../components/Lab/SaveLab/SaveLabButton";

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
      <SelectedDeployment />
      <LabGridLayout>
        {labs !== undefined &&
          labs.map((lab: Lab) => (
            <TemplateCard key={lab.name}>
              <LabCard lab={lab}>
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex justify-start gap-2">
                      <PlanButton variant="primary" lab={lab}>
                        Plan
                      </PlanButton>
                      <ApplyButton variant="primary-outline" lab={lab}>
                        Deploy
                      </ApplyButton>
                      <DestroyButton variant="danger-text" lab={lab}>
                        Destroy
                      </DestroyButton>
                    </div>
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
                    <ExportLabButton lab={lab} variant="secondary-text">
                      Export
                    </ExportLabButton>
                    <SaveLabButton lab={lab} variant="secondary-text">
                      Edit
                    </SaveLabButton>
                    <LoadToBuilderButton variant="secondary-text" lab={lab}>
                      Open
                    </LoadToBuilderButton>
                    <DeleteLabButton lab={lab} variant="danger-text">
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
