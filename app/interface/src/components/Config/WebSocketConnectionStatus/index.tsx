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
        <strong>Connection Issue Detected:</strong> It appears there may be a
        problem with the websocket connection.
        <br />
        To fix, please follow these steps:
        <ol className="ml-4 list-decimal">
          <li>
            Navigate to{" "}
            <a
              href="/settings"
              className="cursor-pointer text-sky-500 underline"
              target="_blank"
            >
              Settings
            </a>{" "}
            and re-select the selected 'Server Endpoint'. (Click on the already
            checked switch)
          </li>
          <li>
            If you still see this message, please contact for support. This is a
            known issue and we are still trying to understand it fully.
          </li>
        </ol>
      </div>
    </div>
  );
}
