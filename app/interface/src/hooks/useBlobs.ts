import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Lab } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getSharedMockCases(): Promise<AxiosResponse<Lab[]>> {
  return axiosInstance("/lab/public/mockcases");
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

function getTempalates(): Promise<AxiosResponse<Lab[]>> {
  return axiosInstance("lab/my");
}

export function useTemplates() {
  return useQuery("mytemplates", getTempalates, {
    select: (data): Lab[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function getSharedTemplates(): Promise<AxiosResponse<Lab[]>> {
  return axiosInstance("labs/sharedtemplates");
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
  return axiosInstance.get("labs/labs");
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
  return axiosInstance.post("/lab", lab);
}

// TODO: Optimistic updates
// ?: Will it make sense to seperate create and update functions? Right now server is handling updates.
export function useCreateLab() {
  const queryClient = useQueryClient();
  return useMutation(createLab, {
    onSuccess: () => {
      queryClient.invalidateQueries("mytemplates");
      queryClient.invalidateQueries("shared-templates");
      queryClient.invalidateQueries("shared-mockcases");
      queryClient.invalidateQueries("shared-labs");
    },
  });
}

function deleteLab(lab: Lab) {
  return axiosInstance.delete("labs", { data: lab });
}

// TODO: Optimistic updates
export function useDeleteLab() {
  const queryClient = useQueryClient();
  return useMutation(deleteLab, {
    onSuccess: () => {
      queryClient.invalidateQueries("mytemplates");
      queryClient.invalidateQueries("shared-templates");
      queryClient.invalidateQueries("shared-mockcases");
      queryClient.invalidateQueries("shared-labs");
    },
  });
}
