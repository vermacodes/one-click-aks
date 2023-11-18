import { useMutation, useQuery, useQueryClient } from "react-query";
import { Lab, TerraformOperation } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";
import { Axios, AxiosResponse } from "axios";

function init(lab: Lab) {
  return axiosInstance.post("/terraform/init", lab);
}

function plan(lab: Lab) {
  return axiosInstance.post("/terraform/plan", lab);
}

function apply(lab: Lab): Promise<AxiosResponse<TerraformOperation>> {
  return axiosInstance.post("/terraform/apply", lab);
}

function destroy(lab: Lab) {
  return axiosInstance.post("/terraform/destroy", lab);
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
  return useMutation(plan, {
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
  return useMutation(apply, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useDestroy() {
  const queryClient = useQueryClient();
  return useMutation(destroy, {
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
    "get-terraform-action-status",
    () => axiosInstance.get(`/terraform/status/${id}`),
    {
      select: (data): TerraformOperation => data.data.data,
    }
  );
}
