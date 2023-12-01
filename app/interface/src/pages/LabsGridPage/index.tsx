import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { useParams } from "react-router-dom";
import SelectedDeployment from "../../components/Deployments/SelectedDeployment";
import LabCard from "../../components/Lab/LabCard";
import Terminal from "../../components/Terminal";
import { LabType } from "../../dataStructures";
import { useGetLabs } from "../../hooks/useGetLabs";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";

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
    if (type.endsWith("lab")) {
      setPageHeading(
        type.charAt(0).toUpperCase() + type.slice(1).replace(/lab$/, " Labs")
      );
    } else if (type.endsWith("case")) {
      setPageHeading(
        type.charAt(0).toUpperCase() + type.slice(1).replace(/case$/, " Cases")
      );
    } else if (type.endsWith("assignment")) {
      setPageHeading("Assignments");
    } else {
      setPageHeading("My Saved Labs (Deprecated) - Use Private Labs");
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
        <p className="text-4xl">No {pageHeading.toLowerCase()} found!</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading={pageHeading}>
      <SelectedDeployment />
      <div className="relative mb-4 w-full">
        <input
          type="text"
          aria-label="Search"
          placeholder={`Filter ${pageHeading.toLowerCase()}`}
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full rounded border bg-slate-50 p-2 pl-10 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500"
        />
        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
      </div>
      <LabGridLayout>
        {filteredLabs?.map((lab) => (
          <LabCard lab={lab} key={lab.id} />
        ))}
      </LabGridLayout>
      <Terminal />
    </PageLayout>
  );
}
