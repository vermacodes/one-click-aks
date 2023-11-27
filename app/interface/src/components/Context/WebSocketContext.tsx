import React, { createContext } from "react";
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

export interface WebSocketContextData {
  actionStatus: ActionStatusType;
  setActionStatus: (value: ActionStatusType) => void;
  logStream: LogsStreamType;
  setLogStream: (value: LogsStreamType) => void;
  terraformOperation: TerraformOperation;
  setTerraformOperation: (value: TerraformOperation) => void;
  actionStatusConnected: boolean;
  setActionStatusConnected: React.Dispatch<React.SetStateAction<boolean>>;
  logStreamConnected: boolean;
  setLogStreamConnected: React.Dispatch<React.SetStateAction<boolean>>;
  terraformOperationConnected: boolean;
  setTerraformOperationConnected: React.Dispatch<React.SetStateAction<boolean>>;
  serverNotification: ServerNotification;
  setServerNotification: (value: ServerNotification) => void;
  serverNotificationConnected: boolean;
  setServerNotificationConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

export const webSocketContextDataDefaultValue: WebSocketContextData = {
  actionStatus: { inProgress: true },
  setActionStatus: () => null,
  logStream: { logs: "" },
  setLogStream: () => null,
  terraformOperation: getDefaultTerraformOperation(),
  setTerraformOperation: () => null,
  actionStatusConnected: false,
  setActionStatusConnected: () => null,
  logStreamConnected: false,
  setLogStreamConnected: () => null,
  terraformOperationConnected: false,
  setTerraformOperationConnected: () => null,
  serverNotification: getDefaultServerNotification(),
  setServerNotification: () => null,
  serverNotificationConnected: false,
  setServerNotificationConnected: () => null,
};

export const WebSocketContext = createContext<WebSocketContextData>(
  webSocketContextDataDefaultValue
);

export function useWebSocketContext() {
  const context = React.useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketContextProvider"
    );
  }
  return context;
}
