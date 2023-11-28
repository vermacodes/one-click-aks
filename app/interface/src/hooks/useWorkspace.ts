import { AxiosResponse } from "axios";
import { useQuery, useQueryClient } from "react-query";
import { TerraformWorkspace } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function terraformWorkspaceList(): Promise<
  AxiosResponse<TerraformWorkspace[]>
> {
  return axiosInstance.get("workspace");
}

function getResources(): Promise<AxiosResponse<string>> {
  return axiosInstance.get("resources");
}

export function useTerraformWorkspace() {
  const queryClient = useQueryClient();
  return useQuery("list-terraform-workspaces", terraformWorkspaceList, {
    select: (data): TerraformWorkspace[] => {
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries("get-resources");
    },
    staleTime: 6000000,
    cacheTime: 6000000,
  });
}

export function useGetResources() {
  return useQuery("get-resources", getResources, {
    select: (data): string => {
      return data.data;
    },
  });
}
