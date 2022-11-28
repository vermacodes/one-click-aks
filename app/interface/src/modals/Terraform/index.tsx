import { useState } from "react";
import { MdClose } from "react-icons/md";
import { SiTerraform } from "react-icons/si";
import TfInit from "../../components/TfInit";
import TfWorkspace from "../../components/TfWorkspace";

export default function Terraform() {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <button
        className="items-center justify-center border-b-2 border-transparent py-1 text-2xl hover:border-b-sky-400 hover:text-sky-400"
        onClick={() => setShowModal(true)}
      >
        <SiTerraform />
      </button>
      <Modal showModal={showModal} setShowModal={setShowModal} />
    </>
  );
}

type ModalProps = {
  showModal: boolean;
  setShowModal(args: boolean): void;
};

function Modal({ showModal, setShowModal }: ModalProps) {
  const [workspaceMenu, setWorkspaceMenu] = useState<boolean>(false);

  if (!showModal) return null;
  return (
    <div
      className="max-w-ful fixed inset-0 flex max-h-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div
        className=" roundedd my-20 w-3/4 space-y-2 divide-y divide-slate-300 bg-slate-100 p-5 dark:divide-slate-700 dark:bg-slate-900"
        onClick={(e) => {
          e.stopPropagation();
          setWorkspaceMenu(false);
        }}
      >
        <div className="w-100 flex justify-between pb-2 ">
          <h1 className="text-3xl">Terraform Settings</h1>
          <button
            onClick={() => setShowModal(false)}
            className="hover:text-sky-500"
          >
            <MdClose className="text-3xl" />
          </button>
        </div>
        <TfInit />
        <TfWorkspace
          workspaceMenu={workspaceMenu}
          setWorkspaceMenu={setWorkspaceMenu}
        />
      </div>
    </div>
  );
}
