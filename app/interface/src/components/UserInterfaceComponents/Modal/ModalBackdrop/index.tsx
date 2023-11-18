type Props = {
  onClick(e: React.MouseEvent<HTMLDivElement>): void;
  children: React.ReactNode;
};

export default function ModalBackdrop({ onClick, children }: Props) {
  return (
    <div
      className="fixed inset-0 z-20 flex max-h-full max-w-full justify-center bg-slate-800 bg-opacity-80 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={(e) => onClick(e)}
    >
      {children}
    </div>
  );
}
