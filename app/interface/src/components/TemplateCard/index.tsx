type Props = {
  children?: React.ReactNode;
  onClick?(args: any): any;
};

export default function TemplateCard({ children, onClick }: Props) {
  return (
    <div
      className="h-fit rounded border border-slate-400 p-4 shadow-md shadow-slate-500 hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500 dark:border-slate-600 dark:shadow-slate-700 dark:hover:border-sky-500 dark:hover:shadow-sky-500"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
