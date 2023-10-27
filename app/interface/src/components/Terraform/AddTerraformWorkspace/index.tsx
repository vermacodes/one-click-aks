import { useState } from "react";
import { MdClose } from "react-icons/md";
import Workspace from "../Workspace";
import Button from "../../UserInterfaceComponents/Button";

type Props = {};

export default function AddTerraformWorkspace({}: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  return (
    <>
      <Button variant="secondary-text" onClick={() => setShowModal(true)}>
        Manage Workspaces
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
  const [workspaceMenu, setWorkspaceMenu] = useState<boolean>(false);

  if (!showModal) return null;
  return (
    <div
      className="max-w-ful fixed inset-0 z-20 flex max-h-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div
        className=" my-20 w-3/4 gap-y-2 divide-y divide-slate-300 overflow-y-auto rounded bg-slate-100 p-5 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
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
        {/* <TfInit /> */}
        <Workspace
          workspaceMenu={workspaceMenu}
          setWorkspaceMenu={setWorkspaceMenu}
        />
        {/* <div className="flex">
          <ResetActionStatus />
        </div> */}
      </div>
    </div>
  );
}
