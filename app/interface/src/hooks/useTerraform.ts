import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { DeploymentType, TerraformOperation } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function init(deployment: DeploymentType, operationId: string) {
  return axiosInstance.post(`/terraform/init/${operationId}`, deployment);
}

function plan(deployment: DeploymentType, operationId: string) {
  return axiosInstance.post(`/terraform/plan/${operationId}`, deployment);
}

function apply(
  deployment: DeploymentType,
  operationId: string
): Promise<AxiosResponse<TerraformOperation>> {
  return axiosInstance.post(`/terraform/apply/${operationId}`, deployment);
}

function destroy(deployment: DeploymentType, operationId: string) {
  return axiosInstance.post(`/terraform/destroy/${operationId}`, deployment);
}

function destroyAndDelete(deployment: DeploymentType, operationId: string) {
  return axiosInstance.post(
    `/terraform/destroyAndDelete/${operationId}`,
    deployment
  );
}

function extend(deployment: DeploymentType, mode: string, operationId: string) {
  return axiosInstance.post(
    `/terraform/extend/${mode}/${operationId}`,
    deployment
  );
}

export function useInit() {
  const queryClient = useQueryClient();
  return useMutation(
    (params: [DeploymentType, string]) => init(params[0], params[1]),
    {
      onMutate: async () => {
        await queryClient.cancelQueries("get-action-status");
        setTimeout(() => {
          queryClient.invalidateQueries("get-action-status");
        }, 100);
      },
      onSuccess: () => {
        queryClient.invalidateQueries("list-terraform-workspaces");
        queryClient.invalidateQueries("get-selected-terraform-workspace");
        queryClient.invalidateQueries("get-resources");
      },
    }
  );
}

export function usePlan() {
  const queryClient = useQueryClient();
  return useMutation(
    (params: [DeploymentType, string]) => plan(params[0], params[1]),
    {
      onMutate: async () => {
        await queryClient.cancelQueries("get-action-status");
        setTimeout(() => {
          queryClient.invalidateQueries("get-action-status");
        }, 100);
      },
      onSuccess: () => {
        queryClient.invalidateQueries("list-terraform-workspaces");
        queryClient.invalidateQueries("get-selected-terraform-workspace");
        queryClient.invalidateQueries("get-resources");
      },
    }
  );
}

export function useApply() {
  const queryClient = useQueryClient();
  return useMutation(
    (params: [DeploymentType, string]) => apply(params[0], params[1]),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("list-terraform-workspaces");
        queryClient.invalidateQueries("get-selected-terraform-workspace");
        queryClient.invalidateQueries("get-resources");
      },
    }
  );
}

export function useDestroy() {
  const queryClient = useQueryClient();
  return useMutation(
    (params: [DeploymentType, string]) => destroy(params[0], params[1]),
    {
      onMutate: async () => {
        await queryClient.cancelQueries("get-action-status");
        setTimeout(() => {
          queryClient.invalidateQueries("get-action-status");
        }, 100);
      },
      onSuccess: () => {
        queryClient.invalidateQueries("list-terraform-workspaces");
        queryClient.invalidateQueries("get-selected-terraform-workspace");
        queryClient.invalidateQueries("get-resources");
      },
    }
  );
}

export function useDestroyAndDelete() {
  const queryClient = useQueryClient();
  return useMutation(
    (params: [DeploymentType, string]) =>
      destroyAndDelete(params[0], params[1]),
    {
      onMutate: async () => {
        await queryClient.cancelQueries("get-action-status");
        setTimeout(() => {
          queryClient.invalidateQueries("get-action-status");
        }, 100);
      },
      onSuccess: () => {
        queryClient.invalidateQueries("list-terraform-workspaces");
        queryClient.invalidateQueries("get-selected-terraform-workspace");
        queryClient.invalidateQueries("get-resources");
      },
    }
  );
}

export function useExtend() {
  const queryClient = useQueryClient();
  return useMutation(
    (params: [DeploymentType, string, string]) =>
      extend(params[0], params[1], params[2]),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("list-terraform-workspaces");
        queryClient.invalidateQueries("get-selected-terraform-workspace");
        queryClient.invalidateQueries("get-resources");
      },
    }
  );
}

export function useTerraformOperationStatus(id: string) {
  return useQuery(
    ["get-terraform-action-status", id],
    () => axiosInstance.get(`/terraform/status/${id}`),
    {
      select: (data): TerraformOperation => data.data,
      enabled: id !== "",
    }
  );
}
