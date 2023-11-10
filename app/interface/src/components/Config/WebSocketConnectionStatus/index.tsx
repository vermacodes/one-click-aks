import { useContext } from "react";
import { WebSocketContext } from "../../../WebSocketContext";

export default function WebSocketConnectionStatus() {
  const { actionStatusConnected, logStreamConnected } =
    useContext(WebSocketContext);

  if (actionStatusConnected && logStreamConnected) {
    return null;
  }

  return (
    <div className="z-5 mt-2 rounded border border-yellow-500 bg-yellow-500 bg-opacity-20 p-2">
      <strong>⚠️ Connection Issue Detected:</strong> There seems to be a problem
      with the websocket connection. This gets fixed if you{" "}
      <a
        href="#"
        onClick={() => window.location.reload()}
        className="cursor-pointer text-sky-600 underline"
      >
        Refresh
      </a>{" "}
      browser. Use Help & Feedback if the problem continues.
    </div>
  );
}
