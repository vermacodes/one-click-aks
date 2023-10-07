import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { TerraformWorkspace } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function terraformWorkspaceList(): Promise<
  AxiosResponse<TerraformWorkspace[]>
> {
  return axiosInstance.get("workspace");
}

function selectWorkspace(workspace: TerraformWorkspace) {
  return axiosInstance.put("workspace", workspace);
}

function addWorkspace(workspace: TerraformWorkspace) {
  return axiosInstance.post("workspace", workspace);
}

function deleteWorkspace(workspace: TerraformWorkspace) {
  return axiosInstance.delete("workspace", { data: workspace });
}

function getResoureces(): Promise<AxiosResponse<string>> {
  return axiosInstance.get("resources");
}

export function useTerraformWorkspace() {
  const queryClient = useQueryClient();
  return useQuery("list-terraform-workspaces", terraformWorkspaceList, {
    select: (data): TerraformWorkspace[] => {
      return data.data;
    },
    onSuccess: (data) => {
      console.log("fetching terraform workspace is success" + data)
      if (data === undefined) {
        //queryClient.invalidateQueries("list-terraform-workspaces");
      }
    },
    onError: (error) => {
      console.log("error fetching terraform workspaces" + error);
      queryClient.invalidateQueries("list-terraform-workspaces");
    },
    staleTime: 6000000,
    cacheTime: 6000000,
  });
}

export function useAddWorkspace() {
  const queryClient = useQueryClient();
  return useMutation(addWorkspace, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useSelectWorkspace() {
  const queryClient = useQueryClient();
  return useMutation(selectWorkspace, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation(deleteWorkspace, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useGetResources() {
  return useQuery("get-resources", getResoureces, {
    select: (data): string => {
      return data.data;
    },
  });
}
