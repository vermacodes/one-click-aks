import { useEffect, useState } from "react";
import MainLayout from "./layouts/MainLayout";
import { ActionStatusType } from "./dataStructures";
import { WebSocketContext } from "./WebSocketContext";

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [data, setActionStatus] = useState<boolean>(true);

  useEffect(() => {
    var darkModeFromLocalStorage = localStorage.getItem("darkMode");
    if (darkModeFromLocalStorage === null) {
      localStorage.setItem("darkMode", "true");
    } else {
      if (darkModeFromLocalStorage === "false") {
        setDarkMode(false);
      }
    }

    const newSocket = new WebSocket("ws://localhost:8881/actionstatusws");
    newSocket.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    newSocket.onmessage = (event) => {
      const data = event.data;
      console.log("WebSocket message received:", data);
      setActionStatus(JSON.parse(data).inProgress);
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      newSocket.close();
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
      <WebSocketContext.Provider value={{ data, setActionStatus }}>
        <MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />
      </WebSocketContext.Provider>
    </div>
  );
}

export default App;
