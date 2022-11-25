import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { TerraformWorkspace } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function terraformWorkspaceList(): Promise<
  AxiosResponse<TerraformWorkspace[]>
> {
  return axiosInstance("workspace");
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

export function useTerraformWorkspace() {
  return useQuery("list-terraform-workspaces", terraformWorkspaceList, {
    select: (data): TerraformWorkspace[] => {
      return data.data;
    },
    onSuccess: (data) => {
      console.log("Workspace :", data);
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
    },
    onMutate: async (newWorkspace: TerraformWorkspace) => {
      await queryClient.cancelQueries("list-terraform-workspaces");
      const prevWorkspaces: AxiosResponse<TerraformWorkspace[]> | undefined =
        queryClient.getQueryData("list-terraform-workspaces");
      if (prevWorkspaces !== undefined) {
        console.log("Expected", [...prevWorkspaces.data, newWorkspace]);

        prevWorkspaces.data.forEach((workspace) => {
          workspace.selected = false;
        });

        queryClient.setQueryData("list-terraform-workspaces", {
          ...prevWorkspaces,
          data: [...prevWorkspaces.data, newWorkspace],
        });
      }
      return { prevWorkspaces, newWorkspace };
    },
    onError: (error, newWorkspace, context) => {
      queryClient.setQueryData(
        "list-terraform-workspaces",
        context?.prevWorkspaces
      );
      queryClient.invalidateQueries("list-terraform-workspaces");
    },
  });
}

export function useSelectWorkspace() {
  const queryClient = useQueryClient();
  return useMutation(selectWorkspace, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
    },
    onMutate: async (selectedWorkspace: TerraformWorkspace) => {
      await queryClient.cancelQueries("list-terraform-workspaces");
      const prevWorkspaces: AxiosResponse<TerraformWorkspace[]> | undefined =
        queryClient.getQueryData("list-terraform-workspaces");
      if (prevWorkspaces !== undefined) {
        console.log("Expected", [...prevWorkspaces.data, selectedWorkspace]);

        prevWorkspaces.data.forEach((workspace) => {
          if (workspace.name === selectedWorkspace.name) {
            workspace.selected = true;
          } else {
            workspace.selected = false;
          }
        });

        queryClient.setQueryData("list-terraform-workspaces", {
          prevWorkspaces,
          data: [...prevWorkspaces.data],
        });
      }
      return { prevWorkspaces, selectedWorkspace };
    },
    onError: (error, selectedWorkspace, context) => {
      queryClient.setQueryData(
        "list-terraform-workspaces",
        context?.prevWorkspaces
      );
      queryClient.invalidateQueries("list-terraform-workspaces");
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation(deleteWorkspace, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
    },
  });
}
