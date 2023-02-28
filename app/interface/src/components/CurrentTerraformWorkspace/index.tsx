import { useState } from "react";
import { SiTerraform } from "react-icons/si";
import { Link } from "react-router-dom";
import { useTerraformWorkspace } from "../../hooks/useWorkspace";
import { MdClose } from "react-icons/md";
import ResetActionStatus from "../../components/ResetActionStatus";
import TfInit from "../../components/TfInit";
import TfWorkspace from "../../components/TfWorkspace";

type Props = {};

export default function index({}: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [menu, showMenu] = useState<boolean>(false);
  const { data } = useTerraformWorkspace();
  return (
    <>
      <button
        className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800"
        onClick={() => setShowModal(true)}
      >
        <span>
          <SiTerraform />
        </span>
        <span>Workspace →</span>
        <span>
          {data &&
            data.map((worksapce) => (
              <div key={worksapce.name}>
                {worksapce.selected && worksapce.name}
              </div>
            ))}
        </span>
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
        <TfWorkspace
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
