import { useState } from "react";
import { FaShare } from "react-icons/fa";
import Button from "../../components/UserInterfaceComponents/Button";
import ExportLabButton from "../../components/Lab/Export/ExportLabButton";
import LabCard from "../../components/Lab/LabCard";
import LoadToBuilderButton from "../../components/Lab/LoadToBuilderButton";
import TemplateCard from "../../components/TemplateCard";
import { Lab } from "../../dataStructures";
import { useSharedTemplates } from "../../hooks/useBlobs";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";
import { toast } from "react-toastify";

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
                <TemplateCards lab={lab} key={lab.id} />
              ))}
          </LabGridLayout>
        )}
      </PageLayout>
    </>
  );
}

// Template Cards display the cards for both template types.

type TemplateCardsProps = {
  lab: Lab;
};

function TemplateCards({ lab }: TemplateCardsProps) {
  const [copied, setCopied] = useState(false);
  function copyLinkToLab(lab: Lab) {
    navigator.clipboard.writeText(
      `${window.location.origin}/lab/sharedtemplate/${lab.id}`
    );

    toast.success("Link copied to clipboard.", {
      autoClose: 1000,
      toastId: "copy-link-to-lab",
    });

    // Set copied to true for 2 seconds
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <TemplateCard key={lab.name}>
      <LabCard lab={lab}>
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex justify-start gap-2">
              <LoadToBuilderButton lab={lab} variant="primary">
                Open
              </LoadToBuilderButton>
              <ExportLabButton lab={lab} variant="secondary-text">
                Export
              </ExportLabButton>
              <Button
                variant={`${copied ? "success-text" : "secondary-text"}`}
                onClick={() => copyLinkToLab(lab)}
              >
                <span>
                  <FaShare />
                </span>
                {copied ? "Done" : "Share"}
              </Button>
            </div>
          </div>
        </>
      </LabCard>
    </TemplateCard>
  );
}
