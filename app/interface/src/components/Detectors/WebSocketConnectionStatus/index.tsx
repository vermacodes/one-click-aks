import { useContext, useEffect, useState } from "react";
import { useServerStatus } from "../../../hooks/useServerStatus";
import { WebSocketContext } from "../../Context/WebSocketContext";

export default function WebSocketConnectionStatus() {
  const { data: serverStatus } = useServerStatus();
  const { actionStatusConnected, logStreamConnected } =
    useContext(WebSocketContext);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // If both are connected, no need to show the warning
    if (actionStatusConnected && logStreamConnected) {
      setShowWarning(false);
      return;
    }

    // Set a timeout to show the warning after 10 seconds
    const timeoutId = setTimeout(() => {
      setShowWarning(true);
    }, 10000);

    // Clear the timeout if the component unmounts or if the connections change
    return () => clearTimeout(timeoutId);
  }, [actionStatusConnected, logStreamConnected]);

  // If server is not running, don't show the warning
  if (serverStatus?.status !== "OK") {
    return null;
  }

  if (!showWarning) {
    return null;
  }

  return (
    <div className="z-5 mt-2 rounded border border-yellow-500 bg-yellow-500 bg-opacity-20 p-2">
      <strong>⚠️ Connection Issue Detected:</strong> Goto{" "}
      <a href="/settings" className="cursor-pointer text-sky-600 underline">
        Settings
      </a>
      , ensure that server is running and Endpoint is correct. All good? this
      should get fixed if you{" "}
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
