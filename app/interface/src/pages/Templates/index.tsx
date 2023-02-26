import DeleteLabButton from "../../components/Lab/DeleteLabButton";
import ExportLabButton from "../../components/Lab/Export/ExportLabButton";
import LabCard from "../../components/Lab/LabCard";
import LoadToBuilderButton from "../../components/Lab/LoadToBuilderButton";
import TemplateCard from "../../components/TemplateCard";
import Terminal from "../../components/Terminal";
import { Lab } from "../../dataStructures";
import { useSharedTemplates, useTemplates } from "../../hooks/useBlobs";
import { useServerStatus } from "../../hooks/useServerStatus";
import LabBuilder from "../../modals/LabBuilder";
import ServerError from "../ServerError";

export default function Templates() {
  const {
    data: sharedLabs,
    isLoading: sharedLabsLoading,
    isFetching: sharedLabsFetching,
  } = useSharedTemplates();

  const {
    data: myLabs,
    isLoading: myLabsLoading,
    isFetching: myLabsFetching,
  } = useTemplates();

  const { data: serverStatus } = useServerStatus();

  if (serverStatus?.status !== "OK") {
    return <ServerError />;
  }

  if (
    myLabsLoading ||
    myLabsFetching ||
    sharedLabsLoading ||
    sharedLabsFetching
  ) {
    return (
      <div className="flex gap-x-4">
        <p className="text-4xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-x-4">
      {/* My Labs Secion */}
      <p className="my-2 border-b-2 border-slate-500 py-4 text-4xl">My Labs</p>
      <div className="w-7/8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myLabs !== undefined &&
          myLabs.map((lab: Lab) => <TemplateCards lab={lab} key={lab.id} />)}
      </div>
      <p className="text-2xl">
        {myLabs?.length === 0 &&
          "You have not saved any templates 🙂. To save, go to builder, build and save. 💾"}
      </p>

      {/* Public Labs Secion */}
      {sharedLabs && sharedLabs?.length !== 0 && (
        <>
          <p className="my-2 border-b-2 border-slate-500 py-4 text-4xl">
            Public Labs
          </p>
          <div className="w-7/8 grid grid-cols-3 gap-4">
            {sharedLabs &&
              sharedLabs.map((lab: Lab) => (
                <TemplateCards lab={lab} key={lab.id} />
              ))}
          </div>
        </>
      )}

      <Terminal />
    </div>
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
