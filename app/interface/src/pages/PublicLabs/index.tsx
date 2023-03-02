import DeleteLabButton from "../../components/Lab/DeleteLabButton";
import ExportLabButton from "../../components/Lab/Export/ExportLabButton";
import LabCard from "../../components/Lab/LabCard";
import LoadToBuilderButton from "../../components/Lab/LoadToBuilderButton";
import TemplateCard from "../../components/TemplateCard";
import { Lab } from "../../dataStructures";
import { useSharedTemplates } from "../../hooks/useBlobs";
import { useServerStatus } from "../../hooks/useServerStatus";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";
import LabBuilder from "../../modals/LabBuilder";
import ServerError from "../ServerError";

export default function PublicLabs() {
  const {
    data: sharedLabs,
    isLoading: sharedLabsLoading,
    isFetching: sharedLabsFetching,
  } = useSharedTemplates();

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
        {sharedLabs && sharedLabs?.length !== 0 && (
          <LabGridLayout>
            {sharedLabs &&
              sharedLabs.map((lab: Lab) => (
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
  return (
    <TemplateCard key={lab.name}>
      <LabCard lab={lab}>
        <>
          <div className="flex flex-wrap justify-end gap-1">
            <DeleteLabButton lab={lab} variant="danger-outline">
              Delete
            </DeleteLabButton>
            <LabBuilder lab={lab} variant="secondary-outline">
              Edit
            </LabBuilder>
            <ExportLabButton lab={lab} variant="secondary-outline">
              Export
            </ExportLabButton>
            <LoadToBuilderButton lab={lab} variant="primary-outline">
              Load To Builder
            </LoadToBuilderButton>
          </div>
        </>
      </LabCard>
    </TemplateCard>
  );
}
