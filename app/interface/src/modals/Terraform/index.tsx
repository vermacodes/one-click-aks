import { useState } from "react";
import { MdClose } from "react-icons/md";
import { SiTerraform } from "react-icons/si";
import ResetActionStatus from "../../components/Config/ResetActionStatus";
import TfInit from "../../components/Config/TerraformInit";
import Workspaces from "../../components/Terraform/Workspaces";

export default function Terraform() {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <button
        className="justify-star flex h-full w-full items-center gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800"
        onClick={() => setShowModal(true)}
      >
        <span>
          <SiTerraform />
        </span>
        <span>Terraform Settings</span>
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
  if (!showModal) return null;
  return (
    <div
      className="max-w-ful fixed inset-0 flex max-h-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div className=" my-20 w-3/4 gap-y-2 divide-y divide-slate-300 overflow-y-auto rounded bg-slate-100 p-5 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600">
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
        <Workspaces />
        <div className="flex">
          <ResetActionStatus />
        </div>
      </div>
    </div>
  );
}
