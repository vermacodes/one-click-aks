import { FaArrowRight, FaChevronRight, FaEllipsisV } from "react-icons/fa";
import Button from "../../components/Button";
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex justify-start gap-2">
              <LoadToBuilderButton lab={lab} variant="primary">
                Load To Builder
              </LoadToBuilderButton>
              <ExportLabButton lab={lab} variant="secondary-text">
                Export
              </ExportLabButton>
            </div>
            <div>
              <Button variant="primary-icon">
                <FaArrowRight />
              </Button>
            </div>
          </div>
        </>
      </LabCard>
    </TemplateCard>
  );
}
