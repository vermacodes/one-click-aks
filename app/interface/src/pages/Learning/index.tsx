import LabCard from "../../components/Lab/LabCard";
import ValidateLabButton from "../../components/Lab/ValidateLabButton";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import ApplyButton from "../../components/Terraform/ApplyButton";
import DestroyButton from "../../components/Terraform/DestroyButton";
import { useGetUserAssignedLabs } from "../../hooks/useAssignment";
import { useServerStatus } from "../../hooks/useServerStatus";
import ServerError from "../ServerError";

export default function Learning() {
  const { data: labs, isLoading, isFetching } = useGetUserAssignedLabs();
  const { data: serverStatus } = useServerStatus();

  if (serverStatus?.status !== "OK") {
    return <ServerError />;
  }

  if (isLoading || isFetching) {
    return (
      <div className="my-3 mb-2">
        <p className="text-4xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="my-3 mb-2">
      <h1 className="my-2 mb-6 border-b-2 border-slate-500 py-4 text-4xl">
        My Assignments
      </h1>
      <div className="w-7/8 grid grid-cols-3 gap-4">
        {labs &&
          labs.map((lab) => (
            <TemplateCard key={lab.id}>
              <LabCard lab={lab}>
                <div className="flex flex-wrap justify-end gap-1">
                  <ApplyButton variant="primary-outline" lab={lab}>
                    Deploy
                  </ApplyButton>
                  <ValidateLabButton lab={lab} variant="primary-outline">
                    Validate
                  </ValidateLabButton>
                  <DestroyButton variant="danger-outline" lab={lab}>
                    Destroy
                  </DestroyButton>
                </div>
              </LabCard>
            </TemplateCard>
          ))}
      </div>
      {labs?.length === 0 ? (
        <p className="text-3xl">Ah! No labs assigned to you.😃</p>
      ) : (
        <Terminal />
      )}
    </div>
  );
}
