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
      queryClient.invalidateQueries("get-resources")
    },
    staleTime: 6000000,
    cacheTime: 6000000,
  });
}

export function useSelectedTerraformWorkspace() {
  const queryClient = useQueryClient();
  return useQuery("get-selected-terraform-workspace", terraformWorkspaceList, {
    select: (data): TerraformWorkspace => {
      var selectedWorkspace = data.data.find((workspace) => workspace.selected);
      if (selectedWorkspace) {
        return selectedWorkspace;
      } else {
        return data.data[0];
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries("get-resources")
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
      queryClient.invalidateQueries("get-selected-terraform-workspace");  
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useSelectWorkspace() {
  const queryClient = useQueryClient();
  return useMutation(selectWorkspace, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation(deleteWorkspace, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
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
