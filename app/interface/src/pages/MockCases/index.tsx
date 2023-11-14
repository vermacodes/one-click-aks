import { useState } from "react";
import LabCard from "../../components/Lab/LabCard";
import Terminal from "../../components/Terminal";
import { Lab } from "../../dataStructures";
import { useSharedMockCases } from "../../hooks/useBlobs";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";
import SelectedDeployment from "../../components/Deployments/SelectedDeployment";

export default function MockCases() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { data: labs, isLoading, isFetching } = useSharedMockCases();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredLabs = labs?.filter((lab: Lab) => {
    return Object.values(lab).some((value: any) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading || isFetching) {
    return (
      <PageLayout heading="Mock Cases">
        <p className="text-4xl">Loading...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading="Mock Cases">
      <SelectedDeployment />
      <input
        type="text"
        placeholder="Search mock cases"
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
