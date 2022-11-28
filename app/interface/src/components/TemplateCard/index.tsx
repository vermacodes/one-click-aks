type Props = {
  children?: React.ReactNode;
  onClick?(args: any): any;
};

export default function TemplateCard({ children, onClick }: Props) {
  return (
    <div
      className="roundedd border border-slate-400  p-4 shadow shadow-slate-300 hover:border-sky-500 dark:border-slate-600 dark:shadow-slate-700 dark:hover:border-sky-500"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
