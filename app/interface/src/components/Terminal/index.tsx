import ansiHTML from "ansi-to-html";
import { useContext, useEffect, useRef, useState } from "react";
import { useLogs, useSetLogs } from "../../hooks/useLogs";
import Checkbox from "../Checkbox";
import LogStreamSwitch from "../LogStream/LogStreamSwitch";
import { WebSocketContext } from "../../WebSocketContext";

export default function Terminal() {
  const [autoScroll, setAutoScroll] = useState(false);
  const { data } = useLogs();
  const { mutate: setLogs } = useSetLogs();
  const { actionStatus } = useContext(WebSocketContext);

  const logContainerRef = useRef<null | HTMLDivElement>(null);
  const logContentRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      logContainerRef.current?.scrollTo({
        top: logContentRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [data, autoScroll]);

  function getAutoScrollFromLocalStorage(): string {
    var autoScrollFromLocalStorage = localStorage.getItem("autoScroll");
    if (autoScrollFromLocalStorage !== null) {
      return autoScrollFromLocalStorage;
    }

    return "";
  }

  function setAutoScrollInLocalStorage(autoScroll: string) {
    localStorage.setItem("autoScroll", autoScroll);
  }

  useEffect(() => {
    var autoScrollFromLocalStorage = getAutoScrollFromLocalStorage();
    if (autoScrollFromLocalStorage === "true") {
      setAutoScroll(true);
    } else {
      setAutoScroll(false);
    }
  }, []);

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
    if (autoScroll) {
      setAutoScrollInLocalStorage("false");
    } else {
      setAutoScrollInLocalStorage("true");
    }
    setAutoScroll(!autoScroll);
  }

  return (
    <div className="relative mt-4">
      <div className="mb-1 flex justify-end gap-x-2 gap-y-2 divide-x divide-slate-500">
        <button
          className="disabled:text-slate-500 hover:text-sky-500 disabled:hover:text-slate-500"
          disabled={actionStatus.inProgress}
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
        <div className="pl-2">
          <LogStreamSwitch />
        </div>
      </div>
      <div
        className="mb-5 h-1/2 max-h-[500px] min-h-[500px] overflow-y-auto rounded border border-slate-900 bg-slate-900 p-4 text-sm text-slate-100 shadow shadow-slate-300 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-thumb-rounded hover:border-sky-500 dark:shadow-slate-700 dark:scrollbar-thumb-slate-600 dark:hover:border-sky-500"
        ref={logContainerRef}
      >
        <div
          ref={logContentRef}
          dangerouslySetInnerHTML={{ __html: updateLogs() }}
          style={{
            padding: "10px",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
          }}
        ></div>
      </div>
    </div>
  );
}
