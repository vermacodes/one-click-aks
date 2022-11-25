import { useState } from "react";
import { MdClose } from "react-icons/md";
import { SiTerraform } from "react-icons/si";
import { primaryButtonClassName } from "../../components/Button";
import TfWorkspace from "../../components/TfWorkspace";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { axiosInstance } from "../../utils/axios-interceptors";

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
  const { data: inProgress } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function initHandler() {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.get("tfinit");
  }

  if (!showModal) return null;
  return (
    <div
      className="max-w-ful fixed inset-0 flex max-h-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div
        className=" my-20 w-3/4 space-y-2 divide-y divide-slate-300 rounded bg-slate-100 p-5 dark:divide-slate-700 dark:bg-slate-900"
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

        {/* Terraform Init */}
        <div>
          <div className="w-100 flex items-center justify-between space-x-2 space-x-reverse py-2">
            <h2 className="text-lg">Initialize Terraform</h2>
            <button
              className={primaryButtonClassName}
              onClick={initHandler}
              disabled={inProgress}
            >
              Terraform Init
            </button>
          </div>
          <div className="flex justify-end">
            <p className="w-1/4 text-right text-xs text-slate-700 dark:text-slate-300">
              Terraform is auto initialized after login. But if you see issues,
              use this to initialize again.
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300"></p>
          </div>
        </div>
        <TfWorkspace
          workspaceMenu={workspaceMenu}
          setWorkspaceMenu={setWorkspaceMenu}
        />
      </div>
    </div>
  );
}
