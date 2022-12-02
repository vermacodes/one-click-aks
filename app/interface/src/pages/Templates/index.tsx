import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import TemplateCard from "../../components/TemplateCard";
import { Lab } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import {
  useDeleteLab,
  useSharedTemplates,
  useTemplates,
} from "../../hooks/useBlobs";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar } from "../../hooks/useTfvar";
import LabBuilder from "../../modals/LabBuilder";

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

  const { mutate: setTfvar } = useSetTfvar();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const { mutate: deleteLab } = useDeleteLab();

  const navigate = useNavigate();

  function handleLoadToEditor(lab: Lab) {
    if (!inProgress) {
      setLogs({
        isStreaming: false,
        logs: JSON.stringify(lab.template, null, 4),
      });
      if (lab.template !== undefined) {
        setTfvar(lab.template);
      }
      navigate("/builder");
    }
  }

  if (
    myLabsLoading ||
    myLabsFetching ||
    sharedLabsLoading ||
    sharedLabsFetching
  ) {
    return (
      <div className="my-3 mx-20 mb-2 flex gap-x-4">
        <p className="text-4xl">Loading...</p>
      </div>
    );
  }

  var labs: Lab[] | undefined;
  // TODO: extract to a single component.
  // TODO: Expandable Divs Arion
  return (
    <div className="my-3 mx-20 mb-2 flex flex-col gap-x-4">
      <p className="my-2 border-b-2 border-slate-500 py-4 text-4xl">My Labs</p>
      <div className="w-7/8 grid grid-cols-3 gap-4">
        {myLabs !== undefined &&
          myLabs.map((lab: Lab) => (
            <TemplateCard key={lab.name}>
              <div className="flex h-full flex-col justify-between gap-y-4">
                <p className="break-all border-b border-slate-500 py-2 text-xl">
                  {lab.name}
                </p>
                <p className="break-all text-sm">{lab.description}</p>
                <div className="flex flex-auto space-x-1 border-b border-slate-500 pb-4">
                  {lab.tags &&
                    lab.tags.map((tag) => (
                      <span className="max-h-5 border border-slate-500 px-3 text-xs">
                        {tag}
                      </span>
                    ))}
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  <Button
                    variant="danger-outline"
                    onClick={() => deleteLab(lab)}
                  >
                    Delete
                  </Button>
                  <LabBuilder lab={lab} variant="secondary-outline">
                    Edit
                  </LabBuilder>
                  <Button
                    variant="primary"
                    onClick={() => handleLoadToEditor(lab)}
                    disabled={inProgress}
                  >
                    Load to Builder
                  </Button>
                </div>
              </div>
            </TemplateCard>
          ))}
      </div>
      <p className="text-2xl">
        {myLabs?.length === 0 &&
          "You have not saved any templates 🙂. To save, go to builder, build and save. 💾"}
      </p>
      {sharedLabs && sharedLabs?.length !== 0 && (
        <>
          <p className="my-2 border-b-2 border-slate-500 py-4 text-4xl">
            Shared Labs
          </p>
          <div className="w-7/8 grid grid-cols-3 gap-4">
            {sharedLabs &&
              sharedLabs.map((lab: Lab) => (
                <TemplateCard key={lab.name}>
                  <div className="flex h-full flex-col justify-between gap-y-4">
                    <p className="break-all border-b border-slate-500 py-2 text-xl">
                      {lab.name}
                    </p>
                    <p className="break-all text-sm">{lab.description}</p>
                    <div className="flex flex-auto space-x-1 border-b border-slate-500 pb-4">
                      {lab.tags &&
                        lab.tags.map((tag) => (
                          <span className="border border-slate-500 px-3 text-xs">
                            {tag}
                          </span>
                        ))}
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        variant="danger-outline"
                        onClick={() => deleteLab(lab)}
                      >
                        Delete
                      </Button>
                      <LabBuilder lab={lab} variant="secondary-outline">
                        Edit
                      </LabBuilder>
                      <Button
                        variant="primary"
                        //onClick={() => deployHandler(lab)}
                        disabled={inProgress}
                      >
                        Load to Builder
                      </Button>
                    </div>
                  </div>
                </TemplateCard>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
