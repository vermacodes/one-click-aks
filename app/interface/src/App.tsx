import MainLayout from "./layouts/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WebSocketContextProvider from "./components/Context/WebSocketContextProvider";
import { AuthProvider } from "./components/Context/AuthContext";
import ServerNotification from "./components/ServerNotification";
import RootErrorBoundary from "./components/ErrorBoundaries/RootErrorBoundary";
import { useGlobalStateContext } from "./components/Context/GlobalStateContext";

function App() {
  const { darkMode } = useGlobalStateContext();
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
          <RootErrorBoundary>
            <MainLayout />
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
            <ServerNotification />
          </RootErrorBoundary>
        </WebSocketContextProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
