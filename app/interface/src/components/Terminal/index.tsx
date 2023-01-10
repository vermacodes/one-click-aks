import { useEffect, useRef, useState } from "react";
import { useLogs, useSetLogs } from "../../hooks/useLogs";
import ansiHTML from "ansi-to-html";
import Checkbox from "../Checkbox";
import { useActionStatus } from "../../hooks/useActionStatus";

export default function Terminal() {
  const [autoScroll, setAutoScroll] = useState(false);
  const { data } = useLogs();
  const { mutate: setLogs } = useSetLogs();
  const { data: inProgress } = useActionStatus();

  const logEndRef = useRef<null | HTMLDivElement>(null);
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function updateLogs(): string {
    if (data !== undefined) {
      var convert = new ansiHTML({
        newline: false,
        escapeXML: false,
        stream: true,
      });
      return convert.toHtml(data.logs);
    }
    return "";
  }

  function handleOnChange() {
    setAutoScroll(!autoScroll);
  }

  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-end gap-x-2 gap-y-2 divide-x divide-slate-500">
        <button
          className="disabled:text-slate-500 hover:text-sky-500 disabled:hover:text-slate-500"
          disabled={inProgress}
          onClick={() => setLogs({ isStreaming: false, logs: "" })}
        >
          Clear Logs
        </button>
        <div className="pl-2">
          <Checkbox
            id="terminal-autoscroll"
            label="Auto Scroll"
            disabled={false}
            checked={autoScroll}
            handleOnChange={handleOnChange}
          />
        </div>
      </div>
      <div className="mb-5 h-1/2 max-h-[500px] min-h-[500px] overflow-y-auto rounded border border-slate-400 p-4  text-sm shadow shadow-slate-300 scrollbar-thin scrollbar-track-slate-300 scrollbar-thumb-sky-500 hover:border-sky-500 dark:border-slate-600 dark:shadow-slate-700 dark:hover:border-sky-500">
        <pre
          dangerouslySetInnerHTML={{ __html: updateLogs() }}
          style={{ padding: "10px", whiteSpace: "pre-wrap" }}
        ></pre>

        {autoScroll && <div ref={logEndRef} />}
      </div>
    </div>
  );
}
