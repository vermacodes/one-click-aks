import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AccountType, LoginStatus, Privildge } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

// function getLoginStatus(): Promise<AxiosResponse<LoginStatus>> {
//   return axiosInstance.get("login");
// }

// function login() {
//   return axiosInstance.post("login");
// }

function getAccounts(): Promise<AxiosResponse<AccountType[]>> {
  return axiosInstance.get("accounts");
}

function setAccount(account: AccountType) {
  return axiosInstance.put("account", account);
}

// export function useLoginStatus() {
//   const queryClient = useQueryClient();
//   return useQuery("login-status", getLoginStatus, {
//     select: (data): boolean | undefined => {
//       if (data !== undefined) {
//         return data.data.isLoggedIn;
//       }
//       return;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries("account");
//     },
//     cacheTime: 5000,
//     staleTime: 5000,
//   });
// }

// export function useLogin() {
//   const queryClient = useQueryClient();
//   return useMutation(login, {
//     onMutate: async () => {
//       await queryClient.cancelQueries("get-action-status");
//       setTimeout(() => {
//         queryClient.invalidateQueries("get-action-status");
//       }, 100);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries("login-status");
//       queryClient.invalidateQueries("get-logs");
//       queryClient.invalidateQueries("get-storage-account");
//       queryClient.invalidateQueries("privilege");
//       queryClient.invalidateQueries("get-lab");
//     },
//   });
// }

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
      queryClient.invalidateQueries("get-lab");
      queryClient.invalidateQueries("get-logs");
    },
  });
}

// function getCurrentAccount(): Promise<AxiosResponse<AccountType>> {
//   return axiosInstance.get("account");
// }

// export function useGetCurrentAccount() {
//   return useQuery("current-account", getCurrentAccount, {
//     select: (data): AccountType => {
//       return data.data;
//     },
//   });
// }

// function configureServicePrincipal() {
//   return axiosInstance.post("service-principal");
// }

// export function useConfigureServicePrincipal() {
//   return useMutation(configureServicePrincipal, {});
// }
