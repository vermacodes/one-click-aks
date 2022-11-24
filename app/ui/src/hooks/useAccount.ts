import { useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";

function getLoginStatus() {
    return axiosInstance.get("loginstatus");
}

function login() {
    return axiosInstance.get("login");
}

function getCurrentAccount() {
    return axiosInstance.get("accountshow");
}

export function useLoginStatus() {
    const queryClient = useQueryClient();
    return useQuery("login-status", getLoginStatus, {
        select: (data) => {
            return data.data.isLoggedIn;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("account");
        },
        cacheTime: 10000,
        staleTime: 10000,
    });
}

export function useLogin() {
    const queryClient = useQueryClient();
    return useQuery("login", login, {
        select: (data) => {
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries("login-status");
            queryClient.invalidateQueries("get-logs");
        },
        enabled: false,
    });
}

export function useAccount() {
    return useQuery("account", getCurrentAccount, {
        select: (data) => {
            return data.data;
        },
        cacheTime: 10000,
        staleTime: 10000,
    });
}
