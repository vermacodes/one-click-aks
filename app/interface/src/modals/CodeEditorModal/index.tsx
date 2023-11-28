import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import {
  FaCheck,
  FaPlus,
  FaRedo,
  FaSave,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import { useGlobalStateContext } from "../../components/Context/GlobalStateContext";
import Terminal from "../../components/Terminal";
import ExtendButton from "../../components/Terraform/ActionButtons/ExtendButton";
import Button from "../../components/UserInterfaceComponents/Button";
import { ButtonVariant, Lab } from "../../dataStructures";

type Props = {
  children?: React.ReactNode;
  variant: ButtonVariant;
  lab?: Lab;
};

export default function CodeEditorModal({ children, variant, lab }: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Button variant="secondary-text" onClick={() => setShowModal(true)}>
        <span>
          <FaPlus />
        </span>
        {children}
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
  const [_extendScript, setExtendScript] = useState<string>();
  const { lab, setLab } = useGlobalStateContext();

  useEffect(() => {
    if (lab !== undefined) {
      setExtendScript(lab.extendScript);
    }
  }, [lab]);

  if (!showModal || lab === undefined) return null;
  return (
    <div
      className="max-w-ful -gap-x-2 fixed inset-0 z-20 flex max-h-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div
        className="w-screen gap-y-2 rounded bg-slate-100 p-5 scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 flex justify-between border-b border-slate-500 pb-1">
          <h1 className="flex items-center text-xl">Extension Script</h1>
          <div className="flex gap-x-2">
            <ExtendButton
              variant="secondary-text"
              lab={lab}
              mode="extend-apply"
            >
              <FaPlus /> Extend
            </ExtendButton>
            <ExtendButton
              variant="secondary-text"
              lab={lab}
              mode="extend-validate"
            >
              <FaCheck /> Validate
            </ExtendButton>
            <ExtendButton
              variant="secondary-text"
              lab={lab}
              mode="extend-destroy"
            >
              <FaTrash /> Destroy
            </ExtendButton>
            <Button
              variant="secondary-text"
              onClick={() => {
                setExtendScript(lab.extendScript);
              }}
            >
              <span>
                <FaRedo />
              </span>
              Reset
            </Button>
            <Button
              variant="secondary-text"
              onClick={() => {
                _extendScript &&
                  setLab({ ...lab, extendScript: _extendScript });
              }}
            >
              <span>
                <FaSave />
              </span>
              Save
            </Button>
            <Button
              variant="danger-text"
              onClick={() => {
                setShowModal(false);
              }}
            >
              <span>
                <FaTimes />
              </span>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowModal(false);
                _extendScript &&
                  setLab({ ...lab, extendScript: _extendScript });
              }}
              variant="primary"
            >
              <span>
                <FaCheck />
              </span>
              Save & Close
            </Button>
          </div>
        </div>
        <div className={`my-1 h-[95%] space-y-1`}>
          <Editor
            height={`100%`}
            width={`100%`}
            language={"shell"}
            value={_extendScript && atob(_extendScript)}
            theme="vs-dark"
            defaultValue="// some comment"
            onChange={(value) => {
              value && setExtendScript(btoa(value));
            }}
          />
        </div>
        <Terminal />
      </div>
    </div>
  );
}
