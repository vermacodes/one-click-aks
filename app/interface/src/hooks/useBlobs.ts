import axios, { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Lab } from "../dataStructures";
import { authAxiosInstance, axiosInstance } from "../utils/axios-interceptors";

function getSharedMockCases(): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance("/lab/protected/mockcases");
}

export function useSharedMockCases() {
  return useQuery("shared-mockcases", getSharedMockCases, {
    select: (data): Lab[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function getTemplates(): Promise<AxiosResponse<Lab[]>> {
  return axiosInstance("lab/my");
}

export function useTemplates() {
  return useQuery("my-templates", getTemplates, {
    select: (data): Lab[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function getSharedTemplates(): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance("lab/public/sharedtemplates");
}

export function useSharedTemplates() {
  return useQuery("shared-templates", getSharedTemplates, {
    select: (data): Lab[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function getSharedLabs(): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance.get("lab/protected/labexercises");
}

export function useSharedLabs() {
  return useQuery("shared-labs", getSharedLabs, {
    select: (data): Lab[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function createLab(lab: Lab): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance.post("/lab/protected", lab);
}

// TODO: Optimistic updates
// ?: Will it make sense to separate create and update functions? Right now server is handling updates.
export function useCreateLab() {
  const queryClient = useQueryClient();
  return useMutation(createLab, {
    onSuccess: () => {
      queryClient.invalidateQueries("my-templates");
      queryClient.invalidateQueries("shared-templates");
      queryClient.invalidateQueries("shared-mockcases");
      queryClient.invalidateQueries("shared-labs");
    },
  });
}

function deleteLab(lab: Lab) {
  return authAxiosInstance.delete("lab/protected", { data: lab });
}

// TODO: Optimistic updates
export function useDeleteLab() {
  const queryClient = useQueryClient();
  return useMutation(deleteLab, {
    onSuccess: () => {
      queryClient.invalidateQueries("my-templates");
      queryClient.invalidateQueries("shared-templates");
      queryClient.invalidateQueries("shared-mockcases");
      queryClient.invalidateQueries("shared-labs");
    },
  });
}

function createMyLab(lab: Lab): Promise<AxiosResponse<Lab[]>> {
  return axiosInstance.post("/lab", lab);
}

// TODO: Optimistic updates
// ?: Will it make sense to separate create and update functions? Right now server is handling updates.
export function useCreateMyLab() {
  const queryClient = useQueryClient();
  return useMutation(createMyLab, {
    onSuccess: () => {
      queryClient.invalidateQueries("my-templates");
    },
  });
}

function deleteMyLab(lab: Lab) {
  return axiosInstance.delete("lab", { data: lab });
}

// TODO: Optimistic updates
export function useDeleteMyLab() {
  const queryClient = useQueryClient();
  return useMutation(deleteMyLab, {
    onSuccess: () => {
      queryClient.invalidateQueries("my-templates");
    },
  });
}
