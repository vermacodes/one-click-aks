import { useParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import { useEffect, useState } from "react";
import LabVersions from "../../components/Lab/LabVersions/LabVersions";
import { useGetLabs } from "../../hooks/useGetLabs";
import { LabType } from "../../dataStructures";

export default function LabVersionsPage() {
  const [pageHeading, setPageHeading] = useState("Version History");
  const { type, id } = useParams();
  const { getLabByTypeAndId } = useGetLabs();

  if (!type || !id) {
    return (
      <PageLayout heading={pageHeading}>
        <p className="text-3xl">Lab not found.</p>
      </PageLayout>
    );
  }

  const { lab, isLoading, isFetching } = getLabByTypeAndId({
    labType: type as LabType,
    labId: id,
  });

  useEffect(() => {
    if (lab) {
      setPageHeading(`Version History - ${lab.name}`);
    }
  }, [lab]);

  if (isLoading || isFetching) {
    return (
      <PageLayout heading={pageHeading}>
        <p className="text-3xl">Loading...</p>
      </PageLayout>
    );
  }

  if (!lab) {
    return (
      <PageLayout heading={pageHeading}>
        <p className="text-3xl">Lab not found.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading={pageHeading}>
      <LabVersions lab={lab} />
    </PageLayout>
  );
}
