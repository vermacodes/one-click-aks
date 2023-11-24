import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import LabCard from "../../components/Lab/LabCard";
import LabGridLayout from "../../layouts/LabGridLayout";
import SelectedDeployment from "../../components/Deployments/SelectedDeployment";
import Terminal from "../../components/Terminal";
import { useGetLabs } from "../../hooks/useGetLabs";
import { LabType } from "../../dataStructures";

export default function LabsGridPage() {
  const { type } = useParams<{ type: LabType }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageHeading, setPageHeading] = useState("Labs");
  const { getLabsByType } = useGetLabs();

  if (!type) {
    return null;
  }

  const { labs, isLoading } = getLabsByType({ labType: type });

  useEffect(() => {
    if (type.endsWith("labs")) {
      setPageHeading(
        type.charAt(0).toUpperCase() + type.slice(1).replace(/labs$/, " Labs")
      );
    }
    if (type.endsWith("cases")) {
      setPageHeading(
        type.charAt(0).toUpperCase() + type.slice(1).replace(/cases$/, " Cases")
      );
    }
    if (type.endsWith("assignments")) {
      setPageHeading(type.charAt(0).toUpperCase() + type.slice(1));
    }
    document.title = "ACT Labs | " + pageHeading;
  }, [type, pageHeading]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(event.target.value);

  const filteredLabs = labs?.filter((lab) =>
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

  if (!labs?.length) {
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
        className="mb-4 w-full rounded border bg-slate-50 p-2 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500"
      />
      <LabGridLayout>
        {filteredLabs?.map((lab) => (
          <LabCard lab={lab} key={lab.id} />
        ))}
      </LabGridLayout>
      <Terminal />
    </PageLayout>
  );
}
