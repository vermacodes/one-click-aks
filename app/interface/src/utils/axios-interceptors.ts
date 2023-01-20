import axios from "axios";

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

  return "http://localhost:8080/";
}
