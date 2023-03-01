import { Lab } from "../../../dataStructures";

type Props = {
  lab: Lab | undefined;
  children: React.ReactNode;
};

export default function LabCard({ lab, children }: Props) {
  if (lab === undefined) {
    return <></>;
  }
  return (
    <div className="flex h-full flex-col justify-between gap-y-6">
      <h1 className="break-all py-2 text-2xl dark:border-slate-700">
        {lab.name}
      </h1>
      <p className="whitespace-pre-line text-sm">{lab.description}</p>
      <div className="flex flex-wrap gap-x-1 gap-y-1  pb-4 dark:border-slate-700">
        {lab.tags &&
          lab.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border px-3 py-1  text-xs selection:border-slate-300 dark:border-slate-700 "
            >
              {tag}
            </span>
          ))}
      </div>
      <>{children}</>
    </div>
  );
}
