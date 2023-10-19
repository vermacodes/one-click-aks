import { createContext } from "react";
import { ActionStatusType } from "./dataStructures";

export interface WebSocketContextData {
  actionStatus: ActionStatusType;
  setActionStatus: (value: ActionStatusType) => void;
}

export const webSocketContextDataDefaultValue: WebSocketContextData = {
  actionStatus: { inProgress: true },
  setActionStatus: () => null,
};

export const WebSocketContext = createContext<WebSocketContextData>(
  webSocketContextDataDefaultValue
);
