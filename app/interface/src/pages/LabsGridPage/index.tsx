import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Lab } from "../../dataStructures";
import {
  useSharedLabs,
  useSharedMockCases,
  useSharedTemplates,
  useTemplates,
} from "../../hooks/useBlobs";
import PageLayout from "../../layouts/PageLayout";
import { useGetUserAssignedLabs } from "../../hooks/useAssignment";
import SelectedDeployment from "../../components/Deployments/SelectedDeployment";
import LabGridLayout from "../../layouts/LabGridLayout";
import Terminal from "../../components/Terminal";
import LabCard from "../../components/Lab/LabCard";

type Props = {};

export default function LabsGridPage({}: Props) {
  const { type } = useParams();
  const [labs, setLabs] = useState<Lab[] | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageHeading, setPageHeading] = useState<string>("Labs");
  const [loading, setLoading] = useState<boolean>(false);

  const sharedTemplates = useSharedTemplates();
  const mockCases = useSharedMockCases();
  const myLabs = useTemplates();
  const readinessLabs = useSharedLabs();
  const myAssignments = useGetUserAssignedLabs();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredLabs = labs?.filter((lab: Lab) => {
    return Object.values(lab).some((value: any) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    let labs;
    if (type === "publiclabs") {
      labs = sharedTemplates.data;
      setLoading(sharedTemplates.isLoading || sharedTemplates.isFetching);
      setPageHeading("Public Labs");
    } else if (type === "mockcases") {
      labs = mockCases.data;
      setLoading(mockCases.isLoading || mockCases.isFetching);
      setPageHeading("Mock Cases");
    } else if (type === "mylabs") {
      labs = myLabs.data;
      setLoading(myLabs.isLoading || myLabs.isFetching);
      setPageHeading("My Saved Labs");
    } else if (type === "readinesslabs") {
      labs = readinessLabs.data;
      setLoading(readinessLabs.isLoading || readinessLabs.isFetching);
      setPageHeading("Readiness Labs");
    } else if (type === "assignments") {
      labs = myAssignments.data;
      setLoading(myAssignments.isLoading || myAssignments.isFetching);
      setPageHeading("Assignments");
    }

    if (labs) {
      setLabs(labs);
      setLoading(false);
    }

    document.title = "ACT Labs | " + pageHeading;
  }, [sharedTemplates, mockCases, myLabs, readinessLabs, type]);

  if (loading) {
    return (
      <PageLayout heading={pageHeading}>
        <p className="text-4xl">Loading...</p>
      </PageLayout>
    );
  }

  if (!labs) {
    return (
      <PageLayout heading="Lab">
        <div className="space-y-4">
          <p className="text-4xl">Well, nothing to show here.</p>
          <p>Do you have right access to see the details of this lab?</p>
        </div>
      </PageLayout>
    );
  }

  if (labs.length === 0) {
    return (
      <PageLayout heading="Lab">
        <div className="space-y-4">
          <p className="text-4xl">No labs found!</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading={pageHeading}>
      <SelectedDeployment />
      <input
        type="text"
        placeholder={"Search " + pageHeading.toLowerCase()}
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-4 w-full rounded border bg-slate-50 p-4 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500 dark:hover:bg-slate-800"
      />
      <LabGridLayout>
        {filteredLabs &&
          filteredLabs.map((lab: Lab) => <LabCard lab={lab} key={lab.id} />)}
      </LabGridLayout>
      <Terminal />
    </PageLayout>
  );
}
