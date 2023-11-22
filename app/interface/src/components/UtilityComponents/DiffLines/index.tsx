import { useEffect, useState } from "react";
import { Change, diffTrimmedLines } from "diff";

type Props = {
  versionA: string;
  versionB: string;
  heading: string;
};

export default function DiffLines({ versionA, versionB, heading }: Props) {
  const [differences, setDifferences] = useState<Change[]>([]);

  useEffect(() => {
    setDifferences(diffTrimmedLines(versionA, versionB));
  }, [versionA, versionB]);

  // If there are no differences, don't render the component
  if (differences.length <= 1) {
    return (
      <div className="flex h-fit max-w-full flex-col justify-between gap-y-6 rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 hover:shadow-lg hover:outline hover:outline-sky-500 dark:bg-slate-900 dark:outline-slate-600 dark:hover:outline-sky-500">
        <h2 className="text-2xl">{heading}</h2>
        <div className="w-full">No differences.</div>
      </div>
    );
  }

  return (
    <div className="flex h-fit max-w-full flex-col justify-between gap-y-6 rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 hover:shadow-lg hover:outline hover:outline-sky-500 dark:bg-slate-900 dark:outline-slate-600 dark:hover:outline-sky-500">
      <h2 className="text-2xl">{heading}</h2>
      <div className="w-full">
        {differences.map((part, index) => (
          <pre
            key={index}
            className={`${
              part.added
                ? "bg-green-500 bg-opacity-20 dark:bg-green-500 dark:bg-opacity-20 "
                : part.removed &&
                  "bg-rose-500 bg-opacity-20 dark:bg-rose-500 dark:bg-opacity-20 "
            } whitespace-pre-wrap text-sm`}
          >
            {part.value}
          </pre>
        ))}
      </div>
    </div>
  );
}
