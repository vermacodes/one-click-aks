import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import ReconnectingWebSocket from "reconnecting-websocket";
import {
  ActionStatusType,
  LogsStreamType,
  ServerNotification,
  TerraformOperation,
} from "../../dataStructures";
import {
  getDefaultServerNotification,
  getDefaultTerraformOperation,
} from "../../defaults";
import { WebSocketContext } from "./WebSocketContext";

export default function WebSocketContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // action status
  const [actionStatus, setActionStatus] = useState<ActionStatusType>({
    inProgress: false,
  });
  const [actionStatusConnected, setActionStatusConnected] = useState(false);

  // log stream
  const [logStream, setLogStream] = useState<LogsStreamType>({
    logs: "",
  });
  const [logStreamConnected, setLogStreamConnected] = useState(false);

  // terraform operation
  const [terraformOperation, setTerraformOperation] =
    useState<TerraformOperation>(getDefaultTerraformOperation());
  const [terraformOperationConnected, setTerraformOperationConnected] =
    useState(false);

  // server notification
  const [serverNotification, setServerNotification] =
    useState<ServerNotification>(getDefaultServerNotification());
  const [serverNotificationConnected, setServerNotificationConnected] =
    useState<boolean>(false);

  const queryClient = useQueryClient();
  useEffect(() => {
    // Action Status Socket. Use baseUrl from localStorage.
    // remove http from the beginning and replace with ws
    // add leading slash if not present
    let baseUrl = localStorage.getItem("baseUrl")?.replace("http", "ws");
    if (baseUrl && !baseUrl.endsWith("/")) {
      baseUrl += "/";
    }

    // action status
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

    // log stream
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

    // terraform operation
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
    };

    // server notification
    const serverNotificationWs = new ReconnectingWebSocket(
      baseUrl + "serverNotificationWs"
    );
    serverNotificationWs.onopen = () => {
      setServerNotificationConnected(true);
    };
    serverNotificationWs.onclose = () => {
      setServerNotificationConnected(false);
    };
    serverNotificationWs.onmessage = (event: MessageEvent) => {
      setServerNotification(JSON.parse(event.data));
    };

    return () => {
      actionStatusWs.close();
      logStreamWs.close();
      terraformOperationWs.close();
      serverNotificationWs.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        actionStatus,
        setActionStatus,
        logStream,
        setLogStream,
        terraformOperation,
        setTerraformOperation,
        actionStatusConnected,
        setActionStatusConnected,
        logStreamConnected,
        setLogStreamConnected,
        terraformOperationConnected,
        setTerraformOperationConnected,
        serverNotification,
        setServerNotification,
        serverNotificationConnected,
        setServerNotificationConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
