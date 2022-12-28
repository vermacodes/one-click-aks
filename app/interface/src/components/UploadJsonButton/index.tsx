import React, { useEffect, useState } from "react";
import { Lab } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";

type Props = {};

export default function index({}: Props) {
  const [lab, _setLab] = useState<Lab | undefined>();
  const { mutate: setLab } = useSetLab();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  useEffect(() => {
    console.log(JSON.stringify(lab, null, 4));
    if (lab != undefined) {
      !inProgress &&
        setLogs({
          isStreaming: false,
          logs: JSON.stringify(lab.template, null, 4),
        });
      setLab(lab);
    }
  }, [lab]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result;
      if (typeof contents === "string") {
        _setLab(JSON.parse(contents));
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <label
        htmlFor="file_input"
        className="text-bold rounded border-2 border-slate-500 bg-slate-500 px-4 py-[2px] text-white disabled:border-slate-400 disabled:bg-slate-400 hover:cursor-pointer hover:border-slate-700 hover:bg-slate-700 disabled:hover:border-slate-400 disabled:hover:bg-slate-400 dark:disabled:border-slate-800 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
      >
        Import
      </label>
      <input
        id="file_input"
        className="hidden"
        type="file"
        accept="application/json"
        onChange={handleFileChange}
      />
    </>
  );
}
