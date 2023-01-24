import { useMutation } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";

function resetServerCache() {
  return axiosInstance.delete("/cache");
}

export function useResetServerCache() {
  return useMutation(resetServerCache);
}
