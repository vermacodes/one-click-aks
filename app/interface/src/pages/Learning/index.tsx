import SelectedDeployment from "../../components/Deployments/SelectedDeployment";
import LabCard from "../../components/Lab/LabCard";
import Terminal from "../../components/Terminal";
import { useGetUserAssignedLabs } from "../../hooks/useAssignment";
import PageLayout from "../../layouts/PageLayout";

export default function Learning() {
  const { data: labs, isLoading, isFetching } = useGetUserAssignedLabs();

  if (isLoading || isFetching) {
    return (
      <PageLayout heading="My Assignments">
        <p className="text-4xl">Loading...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading="My Assignments">
      <SelectedDeployment />
      <div className="w-7/8 grid grid-cols-3 gap-4">
        {labs && labs.map((lab) => <LabCard lab={lab} key={lab.id} />)}
      </div>
      {labs?.length === 0 ? (
        <p className="text-3xl">Ah! No readiness labs assigned to you.😃</p>
      ) : (
        <Terminal />
      )}
    </PageLayout>
  );
}
