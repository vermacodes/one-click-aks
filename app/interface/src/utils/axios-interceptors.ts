import axios, { AxiosRequestConfig } from "axios";

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
  const response = await axiosInstance.get("token", {
    // add your auth credentials here
  });
  return response.data;
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
