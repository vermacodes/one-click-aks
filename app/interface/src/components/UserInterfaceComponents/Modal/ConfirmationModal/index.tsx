import { MdClose } from "react-icons/md";
import Button from "../../Button";

type ModalProps = {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
};

export default function ConfirmationModal({
  title,
  onClose,
  onConfirm,
  children,
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-20 flex max-h-full max-w-full justify-center bg-slate-800 bg-opacity-80 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={(e) => {
        onClose();
        e.stopPropagation();
      }}
    >
      <div
        className="my-20 h-fit w-1/3 space-y-2 divide-y divide-slate-300 overflow-y-auto rounded bg-slate-100 p-5 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 flex justify-between pb-2 ">
          <h1 className="text-3xl">{title}</h1>
          <button onClick={() => onClose()} className="hover:text-sky-500">
            <MdClose className="text-3xl" />
          </button>
        </div>
        <div className="flex flex-col justify-between gap-y-12 pt-4">
          {children}
          <div className="flex justify-end space-x-4">
            <Button variant="danger" onClick={() => onConfirm()}>
              🙂 Pretty Sure!
            </Button>
            <Button variant="primary" onClick={() => onClose()}>
              🤔 May Be Not!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
