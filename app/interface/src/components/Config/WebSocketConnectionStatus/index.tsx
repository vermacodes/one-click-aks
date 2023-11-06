import { useContext } from "react";
import { WebSocketContext } from "../../../WebSocketContext";

export default function WebSocketConnectionStatus() {
  const { actionStatusConnected, logStreamConnected } =
    useContext(WebSocketContext);

  if (actionStatusConnected && logStreamConnected) {
    return null;
  }

  return (
    <div className="my-4">
      <div className="mt-2 rounded border border-red-500 bg-red-500 bg-opacity-20 p-2">
        <strong>Oh no!</strong> Websocket connection seems to be in trouble. If
        this persists, goto{" "}
        <a
          href="/settings"
          className="cursor-pointer hover:text-sky-500 hover:underline"
          target="_blank"
        >
          Settings
        </a>
        , and reset the `Server Endpoint` or `Reset Server Cache` from the
        bottom of the page.
      </div>
    </div>
  );
}
