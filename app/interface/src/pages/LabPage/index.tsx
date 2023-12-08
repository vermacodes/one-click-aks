import { useEffect } from "react";
import { MdArrowBack } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import SelectedDeployment from "../../components/Deployments/SelectedDeployment";
import LabCard from "../../components/Lab/LabCard";
import Terminal from "../../components/Terminal";
import Button from "../../components/UserInterfaceComponents/Button";
import { LabType } from "../../dataStructures";
import { useGetLabs } from "../../hooks/useGetLabs";
import PageLayout from "../../layouts/PageLayout";

export default function LabPage() {
  const { type, id } = useParams();
  const { getLabByTypeAndId } = useGetLabs();
  const navigate = useNavigate();

  const { lab, isLoading, isFetching } = getLabByTypeAndId({
    labType: type as LabType,
    labId: id,
  });

  useEffect(() => {
    if (!lab) {
      navigate(-1); // navigate to some other page
    } else {
      document.title = "ACT Labs | " + lab.name;
    }
  }, [lab, navigate]);

  if (!type || !id || isLoading || isFetching || !lab) {
    return null;
  }

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
      <SelectedDeployment sticky={false} />
      <div className="mb-4 flex items-center text-lg">
        <Button variant="text" onClick={() => navigate(-1)}>
          <MdArrowBack /> Back
        </Button>
      </div>
      <LabCard
        lab={lab}
        fullPage={true}
        showVersions={
          type !== "assignment" && type !== "template" && type !== "challenge"
        }
      />
      <Terminal />
    </PageLayout>
  );
}
