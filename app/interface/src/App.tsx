import { useEffect, useState } from "react";
import MainLayout from "./layouts/MainLayout";
import { WebSocketContext } from "./WebSocketContext";
import {
  ActionStatusType,
  GraphData,
  LogsStreamType,
  TerraformOperation,
} from "./dataStructures";
import ReconnectingWebSocket from "reconnecting-websocket";
import { useQueryClient } from "react-query";
import { setDefaultValuesInLocalStorage } from "./utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthenticatingFullScreen from "./components/Authentication/AuthenticatingFullScreen";
import { defaultTerraformOperation } from "./defaults";

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [actionStatus, setActionStatus] = useState<ActionStatusType>({
    inProgress: false,
  });
  const [logStream, setLogStream] = useState<LogsStreamType>({
    logs: "",
  });
  const [terraformOperation, setTerraformOperation] =
    useState<TerraformOperation>(defaultTerraformOperation);
  const [actionStatusConnected, setActionStatusConnected] = useState(false);
  const [logStreamConnected, setLogStreamConnected] = useState(false);
  const [terraformOperationConnected, setTerraformOperationConnected] =
    useState(false);

  const [graphResponse, setGraphResponse] = useState<GraphData | undefined>();

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

    actionStatusWs.onmessage = (event: MessageEvent) => {
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

    logStreamWs.onmessage = (event: MessageEvent) => {
      setLogStream(JSON.parse(event.data));
    };

    const terraformOperationWs = new ReconnectingWebSocket(
      baseUrl + "terraform/statusws"
    );
    terraformOperationWs.onopen = () => {
      setTerraformOperationConnected(true);
    };

    terraformOperationWs.onclose = () => {
      setTerraformOperationConnected(false);
    };

    terraformOperationWs.onmessage = (event: MessageEvent) => {
      setTerraformOperation(JSON.parse(event.data));
      console.log(JSON.parse(event.data));
    };

    return () => {
      actionStatusWs.close();
      logStreamWs.close();
      terraformOperationWs.close();
    };
  }, []);

  return (
    <div>
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
            terraformOperation,
            setTerraformOperation,
            actionStatusConnected,
            logStreamConnected,
            terraformOperationConnected,
          }}
        >
          {graphResponse ? (
            <MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />
          ) : (
            <AuthenticatingFullScreen
              graphResponse={graphResponse}
              setGraphResponse={setGraphResponse}
            />
          )}
        </WebSocketContext.Provider>
      </div>

      <ToastContainer
        toastClassName={`${
          darkMode ? "bg-slate-100" : "bg-slate-800"
        } relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer`}
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "light" : "dark"}
      />
    </div>
  );
}

export default App;
