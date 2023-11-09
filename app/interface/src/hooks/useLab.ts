import { useMutation, useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";
import { Lab } from "../dataStructures";
import { AxiosError, AxiosResponse } from "axios";

function getLab(): Promise<AxiosResponse<Lab>> {
  return axiosInstance.get("lab");
}

function setLab(lab: Lab) {
  return axiosInstance.put("lab", lab);
}

function deleteLab(): Promise<AxiosResponse> {
  return axiosInstance.delete("lab/redis");
}

export function useLab() {
  return useQuery("get-lab", getLab, {
    select: (data): Lab => {
      return data.data;
    },
  });
}

export function useSetLab() {
  var queryClient = useQueryClient();
  return useMutation(setLab, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-lab");
    },
  });
}

export function useDeleteLab() {
  var queryClient = useQueryClient();
  return useMutation(deleteLab, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-lab");
    },
  });
}
