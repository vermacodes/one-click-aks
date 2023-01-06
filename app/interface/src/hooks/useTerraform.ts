import { useMutation, useQueryClient } from "react-query";
import { Lab } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function init(lab: Lab) {
  return axiosInstance.post("init", lab);
}

function plan(lab: Lab) {
  return axiosInstance.post("plan", lab);
}

function apply(lab: Lab) {
  return axiosInstance.post("apply", lab);
}

function extend(lab: Lab) {
  return axiosInstance.post("apply/extend", lab);
}

function destroyExtend(lab: Lab) {
  return axiosInstance.post("destroy/extend", lab);
}

function validate(lab: Lab) {
  return axiosInstance.post("validate", lab);
}

function destroy(lab: Lab) {
  return axiosInstance.post("destroy", lab);
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
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useApply() {
  const queryClient = useQueryClient();
  return useMutation(apply, {
    onMutate: async () => {
      await queryClient.cancelQueries("get-action-status");
      setTimeout(() => {
        queryClient.invalidateQueries("get-action-status");
      }, 100);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useExtend() {
  const queryClient = useQueryClient();
  return useMutation(extend, {
    onMutate: async () => {
      await queryClient.cancelQueries("get-action-status");
      setTimeout(() => {
        queryClient.invalidateQueries("get-action-status");
      }, 100);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useDestroyExtend() {
  const queryClient = useQueryClient();
  return useMutation(destroyExtend, {
    onMutate: async () => {
      await queryClient.cancelQueries("get-action-status");
      setTimeout(() => {
        queryClient.invalidateQueries("get-action-status");
      }, 100);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useValidate() {
  const queryClient = useQueryClient();
  return useMutation(validate, {
    onMutate: async () => {
      await queryClient.cancelQueries("get-action-status");
      setTimeout(() => {
        queryClient.invalidateQueries("get-action-status");
      }, 100);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("list-terraform-workspaces");
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
      queryClient.invalidateQueries("get-resources");
    },
  });
}
