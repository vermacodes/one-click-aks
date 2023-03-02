import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

import Button from "../../components/Button";
import { ButtonVariant, Lab } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import { useExtend } from "../../hooks/useTerraform";

type Props = {
  children?: React.ReactNode;
  variant: ButtonVariant;
  lab?: Lab;
};

export default function CodeEditor({ children, variant, lab }: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Button variant="secondary-text" onClick={() => setShowModal(true)}>
        <span>
          <FaPlus />
        </span>
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
  const [_extendScript, setExtendScript] = useState<string>();
  const { data: lab } = useLab();
  const { mutate: setLab } = useSetLab();
  const { mutate: extend } = useExtend();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

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
            <Button
              variant="secondary-outline"
              disabled={inProgress}
              onClick={() => {
                // Save
                _extendScript &&
                  setLab({ ...lab, extendScript: _extendScript });

                // Close Modal.
                setShowModal(false);

                // Run
                if (lab !== undefined && !inProgress) {
                  setLogs({ isStreaming: true, logs: "" });
                  extend(lab);
                }
              }}
            >
              Run in Extend Mode
            </Button>
            <Button
              variant="secondary-outline"
              onClick={() => {
                setExtendScript(lab.extendScript);
              }}
            >
              Reset
            </Button>
            <Button
              variant="secondary-outline"
              onClick={() => {
                _extendScript &&
                  setLab({ ...lab, extendScript: _extendScript });
              }}
            >
              Save
            </Button>
            <Button
              variant="danger-outline"
              onClick={() => {
                setShowModal(false);
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowModal(false);
                _extendScript &&
                  setLab({ ...lab, extendScript: _extendScript });
              }}
              variant="primary-outline"
            >
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
      </div>
    </div>
  );
}
