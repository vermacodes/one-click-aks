import ansiHTML from "ansi-to-html";
import DOMPurify from "dompurify";
import ReactHtmlParser from "html-react-parser";
import { useContext, useEffect, useRef, useState } from "react";
import { FaCompress, FaExpand, FaTrashAlt } from "react-icons/fa";
import { useSetLogs } from "../../hooks/useLogs";
import { useSelectedDeployment } from "../../hooks/useSelectedDeployment";
import { WebSocketContext } from "../Context/WebSocketContext";
import DeploymentStatus from "../Deployments/DeploymentStatus";
import Button from "../UserInterfaceComponents/Button";
import Checkbox from "../UserInterfaceComponents/Checkbox";

export default function Terminal() {
  const [autoScroll, setAutoScroll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { logStream: data } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { actionStatus } = useContext(WebSocketContext);

  const logContainerRef = useRef<null | HTMLDivElement>(null);
  const logContentRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && actionStatus.inProgress) {
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
      const dirty = convert.toHtml(data.logs);

      // Sanitize the HTML string
      const clean = DOMPurify.sanitize(dirty);

      return clean;
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
      <div className="space-2 mb-1 flex items-center justify-end gap-x-2 gap-y-2 divide-x divide-slate-500">
        <div className="px-2">
          <Checkbox
            id="terminal-auto-scroll"
            label="Auto Scroll"
            disabled={false}
            checked={autoScroll}
            handleOnChange={handleOnChange}
          />
        </div>
        <Button
          variant="text"
          disabled={actionStatus.inProgress}
          onClick={() => setLogs({ logs: "" })}
        >
          <FaTrashAlt /> Clear Logs
        </Button>
        <div className="px-2">
          <Button variant="text" onClick={() => setShowModal(true)}>
            <FaExpand /> Maximize
          </Button>
        </div>
      </div>
      <div
        className="mb-5 h-1/2 max-h-[500px] min-h-[500px] overflow-y-auto rounded border border-slate-900 bg-slate-900 p-4 text-sm text-slate-100 shadow shadow-slate-300 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-thumb-rounded hover:border-sky-500 dark:shadow-slate-700 dark:scrollbar-thumb-slate-600 dark:hover:border-sky-500"
        ref={logContainerRef}
      >
        <div
          ref={logContentRef}
          className="w-full overflow-x-clip whitespace-pre-wrap break-words font-mono"
        >
          {ReactHtmlParser(updateLogs())}
        </div>
      </div>
      {showModal && <Modal showModal={showModal} setShowModal={setShowModal} />}
    </div>
  );
}

type ModalProps = {
  showModal: boolean;
  setShowModal(args: boolean): void;
};

function Modal({ showModal, setShowModal }: ModalProps) {
  const [autoScroll, setAutoScroll] = useState(false);
  const { logStream: data } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { actionStatus } = useContext(WebSocketContext);
  const { selectedDeployment } = useSelectedDeployment();

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
      const dirty = convert.toHtml(data.logs);

      // Sanitize the HTML string
      const clean = DOMPurify.sanitize(dirty);

      return clean;
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

  if (!showModal) return null;
  return (
    <div
      className="max-w-ful -gap-x-2 fixed inset-0 z-20 flex max-h-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div
        className="w-screen gap-y-2 bg-slate-100 p-5 scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="space-2 mb-1 flex items-center justify-end gap-x-2 gap-y-2 divide-x divide-slate-500">
          <div>
            {selectedDeployment && (
              <DeploymentStatus deployment={selectedDeployment} />
            )}
          </div>
          <div className="pl-2">
            <Checkbox
              id="terminal-auto-scroll"
              label="Auto Scroll"
              disabled={false}
              checked={autoScroll}
              handleOnChange={handleOnChange}
            />
          </div>
          <Button
            variant="text"
            disabled={actionStatus.inProgress}
            onClick={() => setLogs({ logs: "" })}
          >
            <FaTrashAlt /> Clear Logs
          </Button>
          <Button variant="text" onClick={() => setShowModal(false)}>
            <FaCompress /> Minimize
          </Button>
        </div>
        <div
          className="mb-5 h-[90%] overflow-y-auto rounded border border-slate-900 bg-slate-900 p-4 text-sm text-slate-100 shadow shadow-slate-300 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-thumb-rounded hover:border-sky-500 dark:shadow-slate-700 dark:scrollbar-thumb-slate-600 dark:hover:border-sky-500"
          ref={logContainerRef}
        >
          <div
            ref={logContentRef}
            className="w-full overflow-x-clip whitespace-pre-wrap break-words font-mono"
          >
            {ReactHtmlParser(updateLogs())}
          </div>
        </div>
      </div>
    </div>
  );
}
