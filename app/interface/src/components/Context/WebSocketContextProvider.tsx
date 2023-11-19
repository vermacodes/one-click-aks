import { useEffect, useState } from "react";
import { WebSocketContext } from "./WebSocketContext";
import {
  ActionStatusType,
  LogsStreamType,
  TerraformOperation,
} from "../../dataStructures";
import { defaultTerraformOperation } from "../../defaults";
import { useQueryClient } from "react-query";
import ReconnectingWebSocket from "reconnecting-websocket";

export default function WebSocketContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const queryClient = useQueryClient();
  useEffect(() => {
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
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
