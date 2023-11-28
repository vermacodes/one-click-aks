import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Lab } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

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
  const queryClient = useQueryClient();
  return useMutation(setLab, {
    onSuccess: () => {
      queryClient.cancelQueries("get-lab");
      queryClient.invalidateQueries("get-lab");
    },
  });
}

export function useDeleteLab() {
  var queryClient = useQueryClient();
  return useMutation(deleteLab, {
    onSuccess: () => {
      queryClient.cancelQueries("get-lab");
      queryClient.invalidateQueries("get-lab");
    },
  });
}
