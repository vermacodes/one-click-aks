import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import LabCard from "../../components/Lab/LabCard";
import Terminal from "../../components/Terminal";
import { useGetLabs } from "../../hooks/useGetLabs";
import { Lab, LabType } from "../../dataStructures";

export default function LabPage() {
  const { type, id } = useParams();
  const { getLabByTypeAndId } = useGetLabs();

  if (!type || !id) {
    return null;
  }

  const { lab, isLoading, isFetching } = getLabByTypeAndId({
    labType: type as LabType,
    labId: id,
  });

  useEffect(() => {
    document.title = "ACT Labs | " + lab?.name;
  }, [lab]);

  if (isLoading || isFetching) {
    return (
      <PageLayout heading="Lab">
        <p className="text-3xl">Loading...</p>
      </PageLayout>
    );
  }

  if (!lab) {
    return (
      <PageLayout heading="Lab">
        <div className="space-y-4">
          <p className="text-3xl">Well, nothing to show here.</p>
          <p>Do you have right access to see the details of this lab?</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading={lab.name}>
      <LabCard
        lab={lab}
        fullPage={true}
        showVersions={type !== "assignment" && type !== "template"}
      />
      <Terminal />
    </PageLayout>
  );
}
