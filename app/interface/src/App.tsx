import { useEffect, useState } from "react";
import MainLayout from "./layouts/MainLayout";
import { WebSocketContext } from "./WebSocketContext";
import { ActionStatusType, LogsStreamType } from "./dataStructures";
import ReconnectingWebSocket from "reconnecting-websocket";
import { useQueryClient } from "react-query";
import { setDefaultValuesInLocalStorage } from "./utils/helpers";

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [actionStatus, setActionStatus] = useState<ActionStatusType>({
    inProgress: false,
  });
  const [logStream, setLogStream] = useState<LogsStreamType>({
    logs: "",
  });
  const [actionStatusConnected, setActionStatusConnected] = useState(false);
  const [logStreamConnected, setLogStreamConnected] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setDefaultValuesInLocalStorage();

    var darkModeFromLocalStorage = localStorage.getItem("darkMode");
    if (darkModeFromLocalStorage === null) {
      localStorage.setItem("darkMode", "true");
    } else {
      if (darkModeFromLocalStorage === "false") {
        setDarkMode(false);
      }
    }

    // Action Status Socket. Use baseUrl from localStorage.
    // remove http from the beginning and replace with ws
    // add leading slash if not present
    let baseUrl = localStorage.getItem("baseUrl")?.replace("http", "ws");
    if (baseUrl && !baseUrl.endsWith("/")) {
      baseUrl += "/";
    }
    const actionStatusWs = new ReconnectingWebSocket(
      baseUrl + "actionstatusws"
    );

    actionStatusWs.onopen = () => {
      setActionStatusConnected(true);
    };

    actionStatusWs.onclose = () => {
      setActionStatusConnected(false);
    };

    actionStatusWs.onmessage = (event: any) => {
      setActionStatus(JSON.parse(event.data));
      queryClient.invalidateQueries("list-deployments");
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
      queryClient.invalidateQueries("get-resources");
    };

    const logStreamWs = new ReconnectingWebSocket(baseUrl + "logsws");
    logStreamWs.onopen = () => {
      setLogStreamConnected(true);
    };

    logStreamWs.onclose = () => {
      setLogStreamConnected(false);
    };
    logStreamWs.onmessage = (event: any) => {
      setLogStream(JSON.parse(event.data));
    };

    return () => {
      actionStatusWs.close();
      logStreamWs.close();
    };
  }, []);

  return (
    <div
      className={`${
        darkMode
          ? " dark bg-slate-900 text-slate-200"
          : " bg-slate-50 text-slate-900"
      }`}
    >
      <WebSocketContext.Provider
        value={{
          actionStatus,
          setActionStatus,
          logStream,
          setLogStream,
          actionStatusConnected,
          logStreamConnected,
        }}
      >
        <MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />
      </WebSocketContext.Provider>
    </div>
  );
}

export default App;
