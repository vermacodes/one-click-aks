import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { TfvarConfigType } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getTfvar(): Promise<AxiosResponse<TfvarConfigType>> {
  return axiosInstance.get("tfvar");
}

function setTfvar(tfvar: TfvarConfigType) {
  return axiosInstance.post("tfvar", tfvar);
}

function setDefaultTfvar() {
  return axiosInstance.post("tfvardefault");
}

export function useTfvar() {
  return useQuery("get-tfvar", getTfvar, {
    select: (data) => {
      return data.data;
    },
    onSuccess: (data) => {
      if (data === undefined) {
        setTimeout(() => {
          setDefaultTfvar();
        }, 10000);
      }
    },
  });
}

export function useSetTfvar() {
  const queryClient = useQueryClient();
  return useMutation(setTfvar, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-tfvar");
      queryClient.invalidateQueries("get-logs");
    },
  });
}
