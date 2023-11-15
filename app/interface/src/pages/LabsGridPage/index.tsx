import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import LabCard from "../../components/Lab/LabCard";
import LabGridLayout from "../../layouts/LabGridLayout";
import { useGetUserAssignedLabs } from "../../hooks/useAssignment";
import {
  useSharedLabs,
  useSharedMockCases,
  useSharedTemplates,
  useTemplates,
} from "../../hooks/useBlobs";
import { Lab } from "../../dataStructures";
import { UseQueryResult } from "react-query";
import SelectedDeployment from "../../components/Deployments/SelectedDeployment";
import Terminal from "../../components/Terminal";

type DataSourceType = UseQueryResult<Lab[], unknown>;

type DataSourcesType = {
  [key: string]: DataSourceType;
};

export default function LabsGridPage() {
  const { type } = useParams<{ type: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageHeading, setPageHeading] = useState("Labs");

  if (!type) {
    return null;
  }

  const dataSources: DataSourcesType = {
    publiclabs: useSharedTemplates(),
    mockcases: useSharedMockCases(),
    mylabs: useTemplates(),
    readinesslabs: useSharedLabs(),
    assignments: useGetUserAssignedLabs(),
  };

  const dataSource = dataSources[type];
  const labs = dataSource?.data || [];
  const isLoading = dataSource?.isLoading || dataSource?.isFetching;

  useEffect(() => {
    setPageHeading(
      type.charAt(0).toUpperCase() + type.slice(1).replace(/labs$/, " Labs")
    );
    document.title = "ACT Labs | " + pageHeading;
  }, [type, pageHeading]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(event.target.value);

  const filteredLabs = labs.filter((lab) =>
    Object.values(lab).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading)
    return (
      <PageLayout heading={pageHeading}>
        <p className="text-4xl">Loading...</p>
      </PageLayout>
    );

  if (!labs.length) {
    return (
      <PageLayout heading={pageHeading}>
        <p className="text-4xl">No labs found!</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading={pageHeading}>
      <SelectedDeployment />
      <input
        type="text"
        aria-label="Search"
        placeholder={`Search ${pageHeading.toLowerCase()}`}
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-4 w-full rounded border bg-slate-50 p-4 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500"
      />
      <LabGridLayout>
        {filteredLabs.map((lab) => (
          <LabCard lab={lab} key={lab.id} />
        ))}
      </LabGridLayout>
      <Terminal />
    </PageLayout>
  );
}
