import { AxiosResponse } from "axios";
import { useQuery } from "react-query";
import { KubernetesOrchestrators } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getOrchestrators(): Promise<AxiosResponse<KubernetesOrchestrators>> {
  return axiosInstance.get("kubernetesorchestrators");
}

export function useGetOrchestrators() {
  return useQuery("kubernetesorchestrators", getOrchestrators, {
    select: (data): KubernetesOrchestrators => {
      return data.data;
    },
    cacheTime: 10 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });
}
