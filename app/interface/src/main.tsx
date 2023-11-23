import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import { GlobalStateContextProvider } from "./components/Context/GlobalStateContext";

const queryClient = new QueryClient();
const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
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
