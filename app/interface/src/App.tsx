import { useEffect, useState } from "react";
import MainLayout from "./layouts/MainLayout";
import { setDefaultValuesInLocalStorage } from "./utils/helpers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WebSocketContextProvider from "./components/Context/WebSocketContextProvider";
import { AuthProvider } from "./components/Context/AuthContext";

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  useEffect(() => {
    setDefaultValuesInLocalStorage();

    var darkModeFromLocalStorage = localStorage.getItem("darkMode");
    if (darkModeFromLocalStorage === null) {
      localStorage.setItem("darkMode", "true");
    } else {
      if (darkModeFromLocalStorage === "false") {
        setDarkMode(false);
      }
    }
  }, []);

  return (
    <div
      className={`${
        darkMode
          ? " dark bg-slate-900 text-slate-200"
          : " bg-slate-50 text-slate-900"
      }`}
    >
      <AuthProvider>
        <WebSocketContextProvider>
          <MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />
          <ToastContainer
            toastClassName={`${
              darkMode ? "bg-slate-100" : "bg-slate-800"
            } relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer`}
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={darkMode ? "light" : "dark"}
          />
        </WebSocketContextProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
