import {
  InteractionRequiredAuthError,
  PublicClientApplication,
} from "@azure/msal-browser";
import axios, { AxiosError } from "axios";
import { actLabsScope, msalConfig } from "../authConfig";

const pca = new PublicClientApplication(msalConfig);

export const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.code === "ERR_NETWORK") {
      console.error(`Server not running.`);
    }
    return Promise.reject(error.response);
  }
);

// axiosInstance.interceptors.request.use(
//   async (config: AxiosRequestConfig) => {
//     const authToken = await getAuthToken().catch((e) =>
//       myInteractionInProgressHandler()
//     );
//     if (config.headers) {
//       config.headers.Authorization = `Bearer ${authToken}`;
//     } else {
//       config.headers = { Authorization: `Bearer ${authToken}` };
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

axiosInstance.interceptors.request.use(async function (config) {
  const token = await getAuthToken().catch((e) =>
    myInteractionInProgressHandler()
  );

  if (config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    Promise.reject("No headers");
  }
  return config;
});

function getBaseUrl(): string {
  const baseUrlFromLocalStorage = localStorage.getItem("baseUrl");
  if (baseUrlFromLocalStorage != undefined && baseUrlFromLocalStorage !== "") {
    return baseUrlFromLocalStorage;
  }

  return "http://localhost:8880/";
}

// ACTLabs Auth Service

export const authAxiosInstance = axios.create({
  baseURL: getAuthServiceBaseUrl(),
});

// Function to get auth token. This function is called by the axios interceptor
async function getAuthToken(): Promise<string> {
  const accounts = await pca.getAllAccounts();
  const account = accounts[0];

  try {
    const response = await pca.acquireTokenSilent({
      ...actLabsScope,
      account: account,
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const response = await pca.acquireTokenPopup({
        ...actLabsScope,
        account: account,
      });
      return response.accessToken;
    } else {
      throw error;
    }
  }
}

async function myInteractionInProgressHandler() {
  // I am just going to wait for 5 seconds and then call myAcquireToken again.
  // Ideally, it should really be tracking the state of the interaction and then
  // call myAcquireToken again when the interaction is complete.
  // Read More: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/errors.md#interaction_in_progress
  // Sleep for 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // wait is over, call myAcquireToken again to re-try acquireTokenSilent
  return await getAuthToken();
}

// // Axios interceptor to add the auth token to outgoing requests
// authAxiosInstance.interceptors.request.use(
//   async (config: AxiosRequestConfig) => {
//     const authToken = await getAuthToken().catch((e) =>
//       myInteractionInProgressHandler()
//     );
//     if (config.headers) {
//       config.headers.Authorization = `Bearer ${authToken}`;
//     } else {
//       config.headers = { Authorization: `Bearer ${authToken}` };
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

authAxiosInstance.interceptors.request.use(async function (config) {
  const token = await getAuthToken().catch((e) =>
    myInteractionInProgressHandler()
  );

  if (config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    Promise.reject("No headers");
  }
  return config;
});

function getAuthServiceBaseUrl(): string {
  const baseUrlFromLocalStorage = localStorage.getItem("authServiceBaseUrl");
  if (baseUrlFromLocalStorage != undefined && baseUrlFromLocalStorage !== "") {
    return baseUrlFromLocalStorage;
  }

  return "https://actlabs-auth.azurewebsites.net";
}
