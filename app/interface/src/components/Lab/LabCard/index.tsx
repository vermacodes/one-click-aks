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
    <div className="flex h-full flex-col justify-between gap-y-4">
      <p className="break-all border-b border-slate-500 py-2 text-xl">
        {lab.name}
      </p>
      <p className="break-all text-sm">{lab.description}</p>
      <div className="flex flex-auto space-x-1 border-b border-slate-500 pb-4">
        {lab.tags &&
          lab.tags.map((tag) => (
            <span className="border border-slate-500 px-3 text-xs">{tag}</span>
          ))}
      </div>
      <>{children}</>
    </div>
  );
}