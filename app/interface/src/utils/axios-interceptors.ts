import {
  InteractionRequiredAuthError,
  PublicClientApplication,
} from "@azure/msal-browser";
import axios, { AxiosRequestConfig } from "axios";
import { loginRequest, msalConfig } from "../authConfig";

const pca = new PublicClientApplication(msalConfig);

export const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.log(`Server not running.`);
    }
    return error;
  }
);

axiosInstance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const authToken = await getAuthToken();
    if (config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    } else {
      config.headers = { Authorization: `Bearer ${authToken}` };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
      ...loginRequest,
      account: account,
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const response = await pca.acquireTokenPopup({
        ...loginRequest,
        account: account,
      });
      return response.accessToken;
    } else {
      throw error;
    }
  }
}

// Axios interceptor to add the auth token to outgoing requests
authAxiosInstance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const authToken = await getAuthToken();
    if (config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    } else {
      config.headers = { Authorization: `Bearer ${authToken}` };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function getAuthServiceBaseUrl(): string {
  const baseUrlFromLocalStorage = localStorage.getItem("authServiceBaseUrl");
  if (baseUrlFromLocalStorage != undefined && baseUrlFromLocalStorage !== "") {
    return baseUrlFromLocalStorage;
  }

  return "https://actlabs-auth.azurewebsites.net";
}
