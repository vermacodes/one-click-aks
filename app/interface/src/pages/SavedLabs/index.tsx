import DeleteLabButton from "../../components/Lab/DeleteLabButton";
import ExportLabButton from "../../components/Lab/Export/ExportLabButton";
import LabCard from "../../components/Lab/LabCard";
import LoadToBuilderButton from "../../components/Lab/LoadToBuilderButton";
import TemplateCard from "../../components/TemplateCard";
import { Lab } from "../../dataStructures";
import { useTemplates } from "../../hooks/useBlobs";
import { useServerStatus } from "../../hooks/useServerStatus";
import LabGridLayout from "../../layouts/LabGridLayout";
import PageLayout from "../../layouts/PageLayout";
import LabBuilder from "../../modals/LabBuilder";
import ServerError from "../ServerError";

export default function SavedLabs() {
  const {
    data: myLabs,
    isLoading: myLabsLoading,
    isFetching: myLabsFetching,
  } = useTemplates();

  const { data: serverStatus } = useServerStatus();

  if (serverStatus?.status !== "OK") {
    return <ServerError />;
  }

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
        <LabGridLayout>
          {myLabs !== undefined &&
            myLabs.map((lab: Lab) => <TemplateCards lab={lab} key={lab.id} />)}
        </LabGridLayout>
        <p className="text-2xl">
          {myLabs?.length === 0 &&
            "You have not saved any templates 🙂. To save, go to builder, build and save. 💾"}
        </p>
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
          <div className="flex justify-start gap-1">
            <LoadToBuilderButton lab={lab} variant="primary">
              Open
            </LoadToBuilderButton>
            <ExportLabButton lab={lab} variant="secondary-text">
              Export
            </ExportLabButton>
            <DeleteLabButton lab={lab} variant="danger-text">
              Delete
            </DeleteLabButton>
          </div>
        </>
      </LabCard>
    </TemplateCard>
  );
}
