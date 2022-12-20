import { useMutation, useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";
import { Lab } from "../dataStructures";
import { AxiosResponse } from "axios";

function getLab(): Promise<AxiosResponse<Lab>> {
  return axiosInstance.get("lab");
}

function setLab(lab: Lab) {
  return axiosInstance.put("lab", lab);
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
    onSuccess: (data) => {
      queryClient.invalidateQueries("get-lab");
    },
  });
}
