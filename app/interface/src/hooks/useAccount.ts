import axios, { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AccountType } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getLoginStatus() {
  return axiosInstance.get("loginstatus");
}

function login() {
  return axiosInstance.get("login");
}

function getAccounts(): Promise<AxiosResponse<AccountType[]>> {
  return axiosInstance.get("account");
}

function setAccount(account: AccountType) {
  return axiosInstance.put("account", account);
}

export function useLoginStatus() {
  const queryClient = useQueryClient();
  return useQuery("login-status", getLoginStatus, {
    select: (data) => {
      if (data !== undefined) {
        return data.data.isLoggedIn;
      }
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries("account");
    },
    cacheTime: 5000,
    staleTime: 5000,
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
      queryClient.invalidateQueries("get-storage-account");
    },
    enabled: false,
  });
}

export function useAccount() {
  return useQuery("account", getAccounts, {
    select: (data): AccountType[] => {
      return data.data;
    },
    cacheTime: 10000,
    staleTime: 10000,
  });
}

export function useSetAccount() {
  const queryClient = useQueryClient();
  return useMutation(setAccount, {
    onSuccess: () => {
      queryClient.invalidateQueries("account");
      queryClient.invalidateQueries("get-storage-account");
      queryClient.invalidateQueries("get-action-status");
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-preference");
      queryClient.invalidateQueries("get-tfvar");
      queryClient.invalidateQueries("get-logs");
    },
  });
}
