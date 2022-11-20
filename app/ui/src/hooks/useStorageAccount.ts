import { useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";

function getStorageAccount() {
    return axiosInstance.get("getstate");
}

function configureStorageAccount() {
    return axiosInstance.get("configurestate");
}

export function useGetStorageAccount() {
    return useQuery("get-storage-account", getStorageAccount, {
        select: (data) => {
            return data.data;
        },
        cacheTime: 10000,
        staleTime: 10000,
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
        },
        enabled: false,
    });
}
