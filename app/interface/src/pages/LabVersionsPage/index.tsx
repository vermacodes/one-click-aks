import { useParams } from "react-router-dom";
import Terminal from "../../components/Terminal";
import PageLayout from "../../layouts/PageLayout";
import { useEffect, useState } from "react";
import { useGetVersionsById } from "../../hooks/useBlobs";
import LabVersions from "../../components/Lab/LabVersions/LabVersions";

export default function LabVersionsPage() {
  const [pageHeading, setPageHeading] = useState("Version History");
  const { type, id } = useParams();
  const {
    data: labs,
    isLoading,
    isFetching,
  } = useGetVersionsById(
    id,
    type,
    type === "sharedtemplate" ? "public" : "private"
  );

  useEffect(() => {
    var currentVersion = labs?.find((lab) => lab.isCurrentVersion === true);
    if (currentVersion) {
      setPageHeading("Version History - " + currentVersion.name);
    }
    document.title = "ACT Labs | " + pageHeading;
  }, [labs, pageHeading]);

  if (isLoading || isFetching) {
    return (
      <PageLayout heading={pageHeading}>
        <p className="text-3xl">Loading...</p>
      </PageLayout>
    );
  }

  if (!labs) {
    return (
      <PageLayout heading={pageHeading}>
        <p className="text-3xl">No versions found.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading={pageHeading}>
      <LabVersions labs={labs} />
      <Terminal />
    </PageLayout>
  );
}
