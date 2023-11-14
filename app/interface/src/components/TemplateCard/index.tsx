type Props = {
  children?: React.ReactNode;
  onClick?(args: any): any;
};

export default function TemplateCard({ children, onClick }: Props) {
  return (
    <div
      className="h-fit max-w-full rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 hover:shadow-lg hover:outline  hover:outline-sky-500 dark:bg-slate-900 dark:outline-slate-600 dark:hover:outline-sky-500"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
