import LabCard from "../../components/Lab/LabCard";
import ValidateLabButton from "../../components/Lab/ValidateLabButton";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import ApplyButton from "../../components/Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../components/Terraform/ActionButtons/DestroyButton";
import { useGetUserAssignedLabs } from "../../hooks/useAssignment";
import { useServerStatus } from "../../hooks/useServerStatus";
import PageLayout from "../../layouts/PageLayout";
import ServerError from "../ServerError";

export default function Learning() {
  const { data: labs, isLoading, isFetching } = useGetUserAssignedLabs();
  const { data: serverStatus } = useServerStatus();

  if (serverStatus?.status !== "OK") {
    return <ServerError />;
  }

  if (isLoading || isFetching) {
    return (
      <PageLayout heading="My Assignments">
        <p className="text-4xl">Loading...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading="My Assignments">
      <div className="w-7/8 grid grid-cols-3 gap-4">
        {labs &&
          labs.map((lab) => (
            <TemplateCard key={lab.id}>
              <LabCard lab={lab}>
                <div className="flex justify-start gap-1">
                  <ApplyButton variant="primary" lab={lab}>
                    Deploy
                  </ApplyButton>
                  <ValidateLabButton lab={lab} variant="secondary-text">
                    Validate
                  </ValidateLabButton>
                  <DestroyButton variant="danger-text" lab={lab}>
                    Destroy
                  </DestroyButton>
                </div>
              </LabCard>
            </TemplateCard>
          ))}
      </div>
      {labs?.length === 0 ? (
        <p className="text-3xl">Ah! No readiness labs assigned to you.😃</p>
      ) : (
        <Terminal />
      )}
    </PageLayout>
  );
}
