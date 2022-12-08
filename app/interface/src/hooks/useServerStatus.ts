import { AxiosResponse } from "axios";
import { useQuery, useQueryClient } from "react-query";
import { ServerStatus } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getServerStatus(): Promise<AxiosResponse<ServerStatus>> {
  return axiosInstance.get("status");
}

export function useServerStatus() {
  const queryClient = useQueryClient();
  return useQuery("server-status", getServerStatus, {
    select: (data): ServerStatus => {
      return data.data;
    },
    onError: () => {
      queryClient.invalidateQueries("login-status");
    },
    cacheTime: 1000,
    staleTime: 1000,
  });
}

export function useInvalidateServerStatus() {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries("server-status");
}
