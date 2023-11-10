import { useState } from "react";
import { MdClose } from "react-icons/md";
import { Lab } from "../../../../dataStructures";
import SaveLabName from "../SaveLabName";
import SaveLabDescription from "../SaveLabDescription";
import SaveLabType from "../SaveLabType";
import Button from "../../../UserInterfaceComponents/Button";
import { useSetLab } from "../../../../hooks/useLab";
import { useCreateLab, useCreateMyLab } from "../../../../hooks/useBlobs";
import { toast } from "react-toastify";
import { labDescriptionSchema, labNameSchema } from "../../../../zodSchemas";
import SaveLabTags from "../SaveLabTags";

type Props = {
  lab: Lab;
  showModal: boolean;
  setShowModal(args: boolean): void;
};

export default function SaveLabModal({ lab, showModal, setShowModal }: Props) {
  const [labState, setLabState] = useState<Lab>({ ...lab });
  const { mutate: setLab } = useSetLab();
  const { mutateAsync: createMyLab } = useCreateMyLab();
  const { mutateAsync: createLab } = useCreateLab();

  function handleCreateMyLab() {
    const response = toast.promise(createMyLab(labState), {
      pending: "Saving lab...",
      success: "Lab saved.",
      error: {
        render(data: any) {
          return `Lab creation failed: ${data.data.data}`;
        },
        autoClose: false,
      },
    });

    response.then(() => {
      setLab(labState);
      handleModalClose();
    });
  }

  function handleCreateLab() {
    const response = toast.promise(createLab(labState), {
      pending: "Saving lab...",
      success: "Lab saved.",
      error: {
        render(data: any) {
          return `Lab creation failed: ${data.data.data}`;
        },
        autoClose: false,
      },
    });

    response.then(() => {
      setLab(labState);
      handleModalClose();
    });
  }

  function handleModalClose() {
    setShowModal(false);
  }

  if (!showModal) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-20 flex max-h-full max-w-full justify-center bg-slate-800 bg-opacity-80 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className="my-10 h-[90%] w-2/3 space-y-4 overflow-y-auto overflow-x-hidden rounded bg-slate-100 p-5 scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 mb-5 flex justify-between border-b-2 border-b-slate-500 pb-2">
          <h1 className="text-3xl">Save Lab</h1>
          <button
            onClick={() => handleModalClose()}
            className="hover:text-sky-500"
          >
            <MdClose className="text-3xl" />
          </button>
        </div>
        <SaveLabName lab={labState} setLab={setLabState} />
        <SaveLabTags lab={labState} setLab={setLabState} />
        <SaveLabDescription lab={labState} setLab={setLabState} />
        <SaveLabType lab={labState} setLab={setLabState} />
        <div className="flex items-end justify-end gap-x-4">
          <Button
            variant="primary"
            tooltipMessage="Updates the lab in place."
            tooltipDelay={1000}
            tooltipDirection="top"
            disabled={
              !labNameSchema.safeParse(labState.name).success ||
              !labDescriptionSchema.safeParse(labState.description).success
            }
            onClick={() => {
              labState.type === "template"
                ? handleCreateMyLab()
                : handleCreateLab();
            }}
          >
            {lab.id === "" ? "Save" : "Update"}
          </Button>
          {lab.id !== "" && (
            <Button
              variant="primary"
              tooltipMessage="Saves as new copy of lab."
              tooltipDelay={1000}
              tooltipDirection="top"
              disabled={
                !labNameSchema.safeParse(labState.name).success ||
                !labDescriptionSchema.safeParse(labState.description).success
              }
              onClick={() => {
                labState.type === "template"
                  ? handleCreateMyLab()
                  : handleCreateLab();
              }}
            >
              Save as New
            </Button>
          )}
          <Button
            variant="secondary"
            tooltipMessage="Cancel Changes"
            tooltipDelay={1000}
            tooltipDirection="top"
            onClick={handleModalClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
