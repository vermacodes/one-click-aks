import { useState } from "react";
import LabCard from "../../components/Lab/LabCard";
import { Lab } from "../../dataStructures";
import { useSharedTemplates } from "../../hooks/useBlobs";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";

export default function PublicLabs() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const {
    data: sharedLabs,
    isLoading: sharedLabsLoading,
    isFetching: sharedLabsFetching,
  } = useSharedTemplates();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredLabs = sharedLabs?.filter((lab: Lab) => {
    return Object.values(lab).some((value: any) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (sharedLabsLoading || sharedLabsFetching) {
    return (
      <PageLayout heading="Public Labs">
        <p className="text-4xl">Loading...</p>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout heading="Public Labs">
        <input
          type="text"
          placeholder="Search labs"
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4 w-full rounded border bg-slate-50 p-4 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500 dark:hover:bg-slate-800"
        />
        {sharedLabs && sharedLabs?.length !== 0 && (
          <LabGridLayout>
            {filteredLabs &&
              filteredLabs.map((lab: Lab) => (
                <LabCard lab={lab} key={lab.id} />
              ))}
          </LabGridLayout>
        )}
      </PageLayout>
    </>
  );
}
