import { useState } from "react";
import LabCard from "../../components/Lab/LabCard";
import { Lab } from "../../dataStructures";
import { useTemplates } from "../../hooks/useBlobs";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";
import { useServerStatus } from "../../hooks/useServerStatus";
import ServerError from "../ServerError";

export default function SavedLabs() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const {
    data: myLabs,
    isLoading: myLabsLoading,
    isFetching: myLabsFetching,
  } = useTemplates();

  const { data: serverStatus } = useServerStatus();

  if (serverStatus?.status !== "OK") {
    return <ServerError />;
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredLabs = myLabs?.filter((lab: Lab) => {
    return Object.values(lab).some((value: any) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (myLabsLoading || myLabsFetching) {
    return (
      <PageLayout heading="My Saved Labs">
        <p className="text-4xl">Loading...</p>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout heading="My Saved Labs">
        <input
          type="text"
          placeholder="Search labs"
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4 w-full rounded border bg-slate-50 p-4 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500 dark:hover:bg-slate-800"
        />
        <LabGridLayout>
          {filteredLabs !== undefined &&
            filteredLabs.map((lab: Lab) => <LabCard lab={lab} key={lab.id} />)}
        </LabGridLayout>
        <p className="text-2xl">
          {myLabs?.length === 0 &&
            "You have not saved any templates 🙂. To save, go to builder, build and save. 💾"}
        </p>
      </PageLayout>
    </>
  );
}
