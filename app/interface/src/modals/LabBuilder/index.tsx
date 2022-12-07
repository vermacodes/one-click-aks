import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import Button from "../../components/Button";
import { Lab } from "../../dataStructures";
import { useGetPriviledge } from "../../hooks/useAccount";
import { useCreateLab } from "../../hooks/useBlobs";
import { useTfvar } from "../../hooks/useTfvar";
import { axiosInstance } from "../../utils/axios-interceptors";

type Props = {
  children?: React.ReactNode;
  variant:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "primary-outline"
    | "secondary-outline"
    | "danger-outline"
    | "success-outline";
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
  const { data: tfvar, refetch } = useTfvar();
  const { mutate: createLab, isLoading: creatingLab } = useCreateLab();
  const { data: priviledge } = useGetPriviledge();
  const [lab, setLab] = useState<Lab>({
    id: "",
    name: "",
    description: "",
    tags: [""],
    type: "template",
    template: tfvar,
    extendScript: "",
    validateScript: "",
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
    if (tfvar !== undefined && _lab == undefined) {
      setLab({ ...lab, template: tfvar });
    } else {
      refetch;
    }
  }, [tfvar]);

  if (!showModal) return null;
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
          <input
            id="tags"
            type="text"
            value={lab.tags.toString()}
            placeholder="Add comma seperated tags"
            className="px w-full border border-slate-500 bg-inherit p-2 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            onChange={(event) => {
              var result = event.target.value.replace(", ", ",");
              setLab({ ...lab, tags: result.split(",") });
            }}
          />
        </div>
        <div className="my-4">
          <label htmlFor="template">Template</label>
          <textarea
            id="template"
            value={lab.template && JSON.stringify(lab.template, null, 4)}
            className="px h-60 w-full border border-slate-500 bg-inherit p-2 py-2 font-mono text-sm scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            placeholder="This field will auto populate."
          />
        </div>
        {priviledge && (priviledge.isAdmin || priviledge.isMentor) && (
          <>
            <div className="my-4">
              <label htmlFor="labormockcase">Type</label>
              <select
                id="labormockcase"
                defaultValue={lab.type}
                className="px w-full appearance-none border border-slate-500 bg-slate-100 p-2 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700"
                onChange={(event) => {
                  setLab({ ...lab, type: event.target.value });
                }}
              >
                <option value={"template"}>Template</option>
                <option value={"lab"}>Lab Exercise</option>
                <option value={"mockcase"}>Mock Case</option>
              </select>
            </div>
            <div className={`my-4 ${lab.type === "template" && "hidden"}`}>
              <label htmlFor="extendscript">Extend Script</label>
              <textarea
                id="extendscript"
                value={atob(lab.extendScript)}
                className="px h-60 w-full border border-slate-500 bg-inherit p-2 py-2 font-mono text-sm scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                placeholder="Script to extend the cluster."
                onChange={(event) => {
                  setLab({ ...lab, extendScript: btoa(event.target.value) });
                }}
              />
            </div>
            <div className={`my-4 ${lab.type === "template" && "hidden"}`}>
              <label htmlFor="validatescript">Validate Script</label>
              <textarea
                id="validatescript"
                value={atob(lab.validateScript)}
                className="px h-60 w-full border border-slate-500 bg-inherit p-2 py-2 font-mono text-sm scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                placeholder="Script to validate the fix"
                onChange={(event) => {
                  setLab({ ...lab, validateScript: btoa(event.target.value) });
                }}
              />
            </div>
            <div className={`my-4 ${lab.type === "template" && "hidden"}`}>
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
            </div>
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
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
