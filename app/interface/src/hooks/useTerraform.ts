import { useMutation, useQuery, useQueryClient } from "react-query";
import { Lab, TerraformOperation } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";
import { Axios, AxiosResponse } from "axios";

function init(lab: Lab) {
  return axiosInstance.post("/terraform/init", lab);
}

function plan(lab: Lab, operationId: string) {
  return axiosInstance.post(`/terraform/plan/${operationId}`, lab);
}

function apply(
  lab: Lab,
  operationId: string
): Promise<AxiosResponse<TerraformOperation>> {
  return axiosInstance.post(`/terraform/apply/${operationId}`, lab);
}

function destroy(lab: Lab, operationId: string) {
  return axiosInstance.post(`/terraform/destroy/${operationId}`, lab);
}

function extend(lab: Lab, mode: string) {
  return axiosInstance.post(`/terraform/extend/${mode}`, lab);
}

export function useInit() {
  const queryClient = useQueryClient();
  return useMutation(init, {
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
  });
}

export function usePlan() {
  const queryClient = useQueryClient();
  return useMutation((params: [Lab, string]) => plan(params[0], params[1]), {
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
  });
}

export function useApply() {
  const queryClient = useQueryClient();
  return useMutation((params: [Lab, string]) => apply(params[0], params[1]), {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useDestroy() {
  const queryClient = useQueryClient();
  return useMutation((params: [Lab, string]) => destroy(params[0], params[1]), {
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
  });
}

export function useExtend() {
  const queryClient = useQueryClient();
  return useMutation((params: [Lab, string]) => extend(params[0], params[1]), {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
      queryClient.invalidateQueries("get-resources");
    },
  });
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
