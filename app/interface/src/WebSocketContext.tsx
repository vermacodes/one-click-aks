import { createContext } from "react";
import { ActionStatusType } from "./dataStructures";

export interface WebSocketContextData {
  data: boolean;
  setActionStatus: (value: boolean) => void;
}

export const webSocketContextDataDefaultValue: WebSocketContextData = {
  data: false,
  setActionStatus: () => null,
};

export const WebSocketContext = createContext<WebSocketContextData>(
  webSocketContextDataDefaultValue
);
