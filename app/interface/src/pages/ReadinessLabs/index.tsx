import { useState } from "react";
import LabCard from "../../components/Lab/LabCard";
import Terminal from "../../components/Terminal";
import { Lab } from "../../dataStructures";
import { useSharedLabs } from "../../hooks/useBlobs";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";
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
        {labs && labs.map((lab: Lab) => <LabCard lab={lab} key={lab.id} />)}
      </LabGridLayout>
      <Terminal />
    </PageLayout>
  );
}
