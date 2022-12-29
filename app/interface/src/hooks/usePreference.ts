import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Preference } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getPreference(): Promise<AxiosResponse<Preference>> {
  return axiosInstance.get("preference");
}

function setPreference(preference: Preference) {
  return axiosInstance.put("preference", preference);
}

export function usePreference() {
  return useQuery("get-preference", getPreference, {
    select: (data) => {
      return data.data;
    },
  });
}

export function useSetPreference() {
  const queryClient = useQueryClient();
  return useMutation(setPreference, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-preference");
      queryClient.invalidateQueries("get-lab");
      queryClient.invalidateQueries("get-logs");
      queryClient.invalidateQueries("kubernetesorchestrators");
    },
  });
}
