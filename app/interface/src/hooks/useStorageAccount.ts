import { useMutation, useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";
import axios from "axios";

function getStorageAccount() {
  return axiosInstance.get("storageaccount");
}

function configureStorageAccount() {
  return axiosInstance.post("storageaccount");
}

function breakBlobLease(workspaceName: string) {
  return axiosInstance.put(`storageaccount/breakbloblease/${workspaceName}`);
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

export function useBreakBlobLease() {
  return useMutation(breakBlobLease);
}