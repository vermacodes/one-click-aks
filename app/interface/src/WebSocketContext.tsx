import { createContext } from "react";
import { ActionStatusType, LogsStreamType } from "./dataStructures";

export interface WebSocketContextData {
  actionStatus: ActionStatusType;
  setActionStatus: (value: ActionStatusType) => void;
  logStream: LogsStreamType;
  setLogStream: (value: LogsStreamType) => void;
}

export const webSocketContextDataDefaultValue: WebSocketContextData = {
  actionStatus: { inProgress: true },
  setActionStatus: () => null,
  logStream: { logs: "" },
  setLogStream: () => null,
};

export const WebSocketContext = createContext<WebSocketContextData>(
  webSocketContextDataDefaultValue
);
