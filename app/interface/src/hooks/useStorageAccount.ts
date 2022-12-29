import { useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";

function getStorageAccount() {
  return axiosInstance.get("storageaccount");
}

function configureStorageAccount() {
  return axiosInstance.post("storageaccount");
}

export function useGetStorageAccount() {
  return useQuery("get-storage-account", getStorageAccount, {
    select: (data) => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

export function useConfigureStorageAccount() {
  const queryClient = useQueryClient();
  return useQuery("configure-storage-account", configureStorageAccount, {
    select: (data) => {
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries("get-storage-account");
      queryClient.invalidateQueries("get-preference");
    },
    enabled: false,
  });
}
