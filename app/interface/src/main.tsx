import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { msalConfig } from "./authConfig";
import { GlobalStateContextProvider } from "./components/Context/GlobalStateContext";
import ScrollToTop from "./components/UserInterfaceComponents/ScrollToTop";
import "./index.css";

const queryClient = new QueryClient();
const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <ScrollToTop />
        <QueryClientProvider client={queryClient}>
          <GlobalStateContextProvider>
            <App />
          </GlobalStateContextProvider>
          <ReactQueryDevtools initialIsOpen={false} position={"bottom-right"} />
        </QueryClientProvider>
      </BrowserRouter>
    </MsalProvider>
  </React.StrictMode>
);
