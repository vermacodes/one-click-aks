import { useEffect, useState } from "react";
import MainLayout from "./layouts/MainLayout";
import { WebSocketContext } from "./WebSocketContext";
import { ActionStatusType } from "./dataStructures";

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [actionStatus, setActionStatus] = useState<ActionStatusType>({
    inProgress: true,
  });

  useEffect(() => {
    var darkModeFromLocalStorage = localStorage.getItem("darkMode");
    if (darkModeFromLocalStorage === null) {
      localStorage.setItem("darkMode", "true");
    } else {
      if (darkModeFromLocalStorage === "false") {
        setDarkMode(false);
      }
    }

    // Action Status Socket
    const actionStatusSocket = new WebSocket(
      "ws://localhost:8881/actionstatusws"
    );
    actionStatusSocket.onmessage = (event) => {
      setActionStatus(JSON.parse(event.data));
    };

    return () => {
      actionStatusSocket.close();
    };
  }, []);

  return (
    <div
      className={`${
        darkMode
          ? " dark bg-slate-900 text-slate-200"
          : " bg-slate-50 text-slate-900"
      }`}
    >
      <WebSocketContext.Provider value={{ actionStatus, setActionStatus }}>
        <MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />
      </WebSocketContext.Provider>
    </div>
  );
}

export default App;
