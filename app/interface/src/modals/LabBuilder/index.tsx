import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import Button from "../../components/Button";
import { ButtonVariant, Lab } from "../../dataStructures";
import { useGetPriviledge } from "../../hooks/useAccount";
import { useCreateLab } from "../../hooks/useBlobs";
import { useLab } from "../../hooks/useLab";

type Props = {
  children?: React.ReactNode;
  variant: ButtonVariant;
  lab?: Lab;
};

export default function LabBuilder({ children, variant, lab }: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Button variant={variant} onClick={() => setShowModal(true)}>
        {children}
      </Button>
      <Modal _lab={lab} showModal={showModal} setShowModal={setShowModal} />
    </>
  );
}

type ModalProps = {
  _lab?: Lab;
  showModal: boolean;
  setShowModal(args: boolean): void;
};

function Modal({ _lab, showModal, setShowModal }: ModalProps) {
  const [tag, setTag] = useState<string>("");
  const { data: labInMemory, refetch } = useLab();
  const { mutate: createLab, isLoading: creatingLab } = useCreateLab();
  const { data: priviledge } = useGetPriviledge();
  const [lab, setLab] = useState<Lab>({
    id: "",
    name: "",
    description: "",
    tags: [""],
    type: "template",
    template: labInMemory?.template,
    extendScript: "",
    message: "",
    createdby: "",
    updatedby: "",
    createdon: Date(),
    updatedon: Date(),
  });

  useEffect(() => {
    if (_lab !== undefined) {
      setLab(_lab);
    }
  }, []);

  useEffect(() => {
    if (labInMemory !== undefined && _lab == undefined) {
      setLab({ ...labInMemory });
    } else {
      refetch;
    }
  }, [labInMemory]);

  if (!showModal || lab === undefined) return null;
  return (
    <div
      className="max-w-ful -gap-x-2 fixed inset-0 flex max-h-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div
        className=" my-20 w-3/4 gap-y-2 rounded bg-slate-100 p-5 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 dark:divide-slate-700 dark:bg-slate-900"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 flex justify-between border-b border-slate-500 pb-2">
          <h1 className="text-3xl">Save Lab</h1>
          <button
            onClick={() => setShowModal(false)}
            className="border border-slate-100 px-1 py-1 hover:border-rose-500 hover:text-rose-500 dark:border-slate-900 dark:hover:border-rose-500"
          >
            <MdClose className="text-3xl" />
          </button>
        </div>
        <div className="my-4">
          <label htmlFor="labName">Name</label>
          <input
            id="labName"
            value={lab.name}
            type="text"
            className="px w-full border border-slate-500 bg-inherit p-2 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            placeholder="Lab name"
            onChange={(event) => {
              setLab({ ...lab, name: event.target.value });
            }}
          />
        </div>
        <div className="my-4">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={lab.description}
            className="px w-full border border-slate-500 bg-inherit p-2 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            placeholder="Ad as much details as possible. This will be visible to the users"
            onChange={(event) => {
              setLab({ ...lab, description: event.target.value });
            }}
          />
        </div>
        <div className="my-4">
          <label htmlFor="tags">Tags</label>
          <div className="flex items-center  gap-x-2 border border-slate-500 bg-inherit focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:hover:bg-slate-700">
            <Tags lab={lab} setLab={setLab} />
            <form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                lab.tags.push(tag);
                setLab(lab);
                setTag("");
              }}
            >
              <input
                id="tags"
                type="text"
                value={tag}
                placeholder="Add tag"
                className="px w-full border-none bg-inherit p-2 py-2 outline-none"
                onChange={(event) => {
                  var updatedTag = event.target.value.replace(" ", "_");
                  setTag(updatedTag);
                }}
              />
            </form>
          </div>
        </div>
        <div className="my-4 h-60 space-y-1">
          <label htmlFor="template">Template</label>
          <Editor
            height={`95%`}
            width={`100%`}
            language={"json"}
            value={lab.template && JSON.stringify(lab.template, null, 4)}
            theme="vs-dark"
            defaultValue="// some comment"
            onChange={(value) => {
              value && setLab({ ...lab, extendScript: btoa(value) });
            }}
          />
        </div>
        <div className={`my-4 h-60 space-y-1`}>
          <label htmlFor="extendscript">Extend Script</label>
          <Editor
            height={`95%`}
            width={`100%`}
            language={"shell"}
            value={atob(lab.extendScript)}
            theme="vs-dark"
            defaultValue="// some comment"
            onChange={(value) => {
              value && setLab({ ...lab, extendScript: btoa(value) });
            }}
          />
        </div>
        {priviledge && (priviledge.isAdmin || priviledge.isMentor) && (
          <>
            <div className="my-4">
              <label htmlFor="labtype">Type</label>
              <select
                id="labtype"
                defaultValue={lab.type}
                className="px w-full appearance-none border border-slate-500 bg-slate-100 p-2 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700"
                onChange={(event) => {
                  setLab({ ...lab, type: event.target.value });
                }}
              >
                <option value={"template"}>Template</option>
                <option value={"sharedtemplate"}>Shared Template</option>
                <option value={"labexercise"}>Lab Exercise</option>
                <option value={"mockcase"}>Mock Case</option>
              </select>
            </div>
            {/* Enable this on UI after implementation */}
            {/* <div
              className={`my-4 ${
                (lab.type === "template" || lab.type === "sharedtemplate") &&
                "hidden"
              }`}
            >
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={lab.message}
                className="px h-24 w-full border border-slate-500 bg-inherit p-2 py-2 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                placeholder="This message will be displayed to the user once the lab env is setup. Think of it like case statement"
                onChange={(event) => {
                  setLab({ ...lab, message: event.target.value });
                }}
              />
            </div> */}
          </>
        )}
        <div className="flex justify-end gap-x-4">
          <Button
            variant="secondary-outline"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              createLab(lab);
              setShowModal(false);
            }}
          >
            {lab.id !== "" ? "Update" : "Save"}
          </Button>
          {lab.id !== "" && (
            <Button
              variant="primary"
              onClick={() => {
                lab.id = "";
                createLab(lab);
                setShowModal(false);
              }}
            >
              Save as New
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

type TagsPros = {
  lab: Lab;
  setLab(args: Lab): void;
};

function Tags({ lab, setLab }: TagsPros) {
  function deleteTag(tagToBeDeleted: string) {
    var filteredTags = lab.tags.filter((tag) => tag !== tagToBeDeleted);
    setLab({ ...lab, tags: filteredTags });
  }

  return (
    <div className="flex flex-auto space-x-1 rounded px-2">
      {lab.tags &&
        lab.tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center justify-between gap-x-2 rounded border border-slate-500 bg-slate-500 p-1 px-2 text-xs text-slate-100"
          >
            <span>{tag}</span>
            <button
              className="h-4 w-4 rounded bg-slate-500 text-slate-100 hover:bg-sky-500"
              onClick={() => deleteTag(tag)}
            >
              x
            </button>
          </div>
        ))}
    </div>
  );
}
