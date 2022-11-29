import { useState } from "react";
import { MdClose } from "react-icons/md";
import Button from "../../components/Button";
import { Lab } from "../../dataStructures";
import { useTfvar } from "../../hooks/useTfvar";

export default function LabBuilder() {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setShowModal(true)}>
        Create Lab
      </Button>
      <Modal showModal={showModal} setShowModal={setShowModal} />
    </>
  );
}

type ModalProps = {
  showModal: boolean;
  setShowModal(args: boolean): void;
};

function Modal({ showModal, setShowModal }: ModalProps) {
  const { data: tfvar } = useTfvar();
  const [lab, setLab] = useState<Lab>({
    name: "",
    description: "",
    tags: [""],
    type: "lab",
    template: tfvar,
    breakScript: "",
    validateScript: "",
    message: "",
    createdby: "",
    updatedby: "",
    createdon: Date(),
    updatedon: Date(),
  });

  console.log(JSON.stringify(lab, null, 4));

  if (!showModal) return null;
  return (
    <div
      className="max-w-ful -gap-x-2 fixed inset-0 flex max-h-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div
        className=" roundedd my-20 w-3/4 gap-y-2 bg-slate-100 p-5 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 dark:divide-slate-700 dark:bg-slate-900"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 flex justify-between border-b border-slate-500 pb-2">
          <h1 className="text-3xl">Lab and Mock Case Builder</h1>
          <button
            onClick={() => setShowModal(false)}
            className="border border-slate-100 px-1 py-1 hover:border-rose-500 hover:text-rose-500 dark:border-slate-900 dark:hover:border-rose-500"
          >
            <MdClose className="text-3xl" />
          </button>
        </div>
        <div className="my-4">
          <label htmlFor="labName">Lab name</label>
          <input
            id="labName"
            value={lab.name}
            type="text"
            className="px w-full border border-slate-500 bg-inherit p-2 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            className="px w-full border border-slate-500 bg-inherit p-2 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ad as much details as possible. This will be visible to the users"
            onChange={(event) => {
              setLab({ ...lab, description: event.target.value });
            }}
          />
        </div>
        <div className="my-4">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            type="text"
            value={lab.tags.toString()}
            placeholder="Add comma seperated tags"
            className="px w-full border border-slate-500 bg-inherit p-2 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            onChange={(event) => {
              var result = event.target.value.replace(", ", ",");
              setLab({ ...lab, tags: result.split(",") });
            }}
          />
        </div>
        <div className="my-4">
          <label htmlFor="labormockcase">Lab or Mock Case</label>
          <select
            id="labormockcase"
            className="px w-full border border-slate-500 bg-inherit p-2 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            onChange={(event) => {
              setLab({ ...lab, type: event.target.value });
            }}
          >
            <option>lab</option>
            <option>mock case</option>
          </select>
        </div>
        <div className="my-4">
          <label htmlFor="template">Template</label>
          <textarea
            id="template"
            value={lab.template && JSON.stringify(lab.template, null, 4)}
            disabled
            className="px h-60 w-full border border-slate-500 bg-inherit p-2 py-2 font-mono text-sm scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="This field will auto populate."
          />
        </div>
        <div className="my-4">
          <label htmlFor="breakscript">Break Script</label>
          <textarea
            id="breakscript"
            value={atob(lab.breakScript)}
            className="px h-60 w-full border border-slate-500 bg-inherit p-2 py-2 font-mono text-sm scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ad as much details as possible. This will be visible to the users"
            onChange={(event) => {
              setLab({ ...lab, breakScript: btoa(event.target.value) });
            }}
          />
        </div>
        <div className="my-4">
          <label htmlFor="validatescript">Validate Script</label>
          <textarea
            id="validatescript"
            value={atob(lab.validateScript)}
            className="px h-60 w-full border border-slate-500 bg-inherit p-2 py-2 font-mono text-sm scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Add validation script."
            onChange={(event) => {
              setLab({ ...lab, breakScript: btoa(event.target.value) });
            }}
          />
        </div>
        <div className="my-4">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={lab.message}
            className="px h-24 w-full border border-slate-500 bg-inherit p-2 py-2 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="This message will be displayed to the user once the lab env is setup. Think of it like case statement"
            onChange={(event) => {
              setLab({ ...lab, message: event.target.value });
            }}
          />
        </div>
        <div className="flex justify-end gap-x-4">
          <Button variant="secondary-outline">Cancel</Button>
          <Button variant="primary">Create Lab</Button>
        </div>
      </div>
    </div>
  );
}
