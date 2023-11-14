import { useEffect } from "react";
import LabCard from "../../components/Lab/LabCard";
import { Lab } from "../../dataStructures";
import PageLayout from "../../layouts/PageLayout";

type Props = {
  lab: Lab;
};

export default function LabPage({ lab }: Props) {
  useEffect(() => {
    document.title = "ACT Labs | " + lab.name;
  }, [lab]);

  return (
    <PageLayout heading={lab.name}>
      <LabCard lab={lab} fullPage={true} />
    </PageLayout>
  );
}
