import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

import Button from "../../components/Button";
import { Lab } from "../../dataStructures";
import { useCreateLab } from "../../hooks/useBlobs";
import { useLab, useSetLab } from "../../hooks/useLab";

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

export default function CodeEditor({ children, variant, lab }: Props) {
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
  const [_extendScript, setExtendScript] = useState<string>();
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();
  const { mutate: createLab, isLoading: creatingLab } = useCreateLab();

  useEffect(() => {
    if (lab !== undefined) {
      setExtendScript(lab.extendScript);
    }
  }, [lab]);

  if (!showModal || lab === undefined) return null;
  return (
    <div
      className="max-w-ful -gap-x-2 fixed inset-0 flex max-h-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div
        className="w-screen gap-y-2 rounded bg-slate-100 p-5 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 dark:divide-slate-700 dark:bg-slate-900"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 flex justify-between border-b border-slate-500">
          <h1 className="text-xl">Code Editor</h1>
          <button
            onClick={() => {
              setShowModal(false);
              _extendScript && setLab({ ...lab, extendScript: _extendScript });
            }}
            className="border border-slate-100 px-1 py-1 hover:border-rose-500 hover:text-rose-500 dark:border-slate-900 dark:hover:border-rose-500"
          >
            <MdClose className="text-3xl" />
          </button>
        </div>
        <div className={`my-1 h-[95%] space-y-1`}>
          <Editor
            height={`100%`}
            width={`100%`}
            language={"shell"}
            value={atob(lab.extendScript)}
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
