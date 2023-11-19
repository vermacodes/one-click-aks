import { createContext } from "react";
import {
  ActionStatusType,
  LogsStreamType,
  TerraformOperation,
} from "./dataStructures";
import React from "react";
import { defaultTerraformOperation } from "./defaults";

export interface WebSocketContextData {
  actionStatus: ActionStatusType;
  setActionStatus: (value: ActionStatusType) => void;
  logStream: LogsStreamType;
  setLogStream: (value: LogsStreamType) => void;
  terraformOperation: TerraformOperation;
  setTerraformOperation: (value: TerraformOperation) => void;
  actionStatusConnected: boolean;
  logStreamConnected: boolean;
  terraformOperationConnected: boolean;
}

export const webSocketContextDataDefaultValue: WebSocketContextData = {
  actionStatus: { inProgress: true },
  setActionStatus: () => null,
  logStream: { logs: "" },
  setLogStream: () => null,
  terraformOperation: defaultTerraformOperation,
  setTerraformOperation: () => null,
  actionStatusConnected: false,
  logStreamConnected: false,
  terraformOperationConnected: false,
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
