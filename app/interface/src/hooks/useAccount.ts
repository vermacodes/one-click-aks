import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AccountType } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getAccounts(): Promise<AxiosResponse<AccountType[]>> {
  return axiosInstance.get("accounts");
}

function setAccount(account: AccountType) {
  return axiosInstance.put("account", account);
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
      queryClient.invalidateQueries();
      queryClient.invalidateQueries("account");
      queryClient.invalidateQueries("get-storage-account");
      queryClient.invalidateQueries("get-action-status");
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
      queryClient.invalidateQueries("get-preference");
      queryClient.invalidateQueries("get-lab");
      queryClient.invalidateQueries("get-logs");
    },
  });
}
