import { createContext } from "react";
import { ActionStatusType, LogsStreamType } from "./dataStructures";

export interface WebSocketContextData {
  actionStatus: ActionStatusType;
  setActionStatus: (value: ActionStatusType) => void;
  logStream: LogsStreamType;
  setLogStream: (value: LogsStreamType) => void;
  actionStatusConnected: boolean;
  logStreamConnected: boolean;
}

export const webSocketContextDataDefaultValue: WebSocketContextData = {
  actionStatus: { inProgress: true },
  setActionStatus: () => null,
  logStream: { logs: "" },
  setLogStream: () => null,
  actionStatusConnected: false,
  logStreamConnected: false,
};

export const WebSocketContext = createContext<WebSocketContextData>(
  webSocketContextDataDefaultValue
);
