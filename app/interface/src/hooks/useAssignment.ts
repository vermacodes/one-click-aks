import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Assignment, BulkAssignment, Lab } from "../dataStructures";
import { authAxiosInstance } from "../utils/axios-interceptors";

function getAssignments(): Promise<AxiosResponse<Assignment[]>> {
  return authAxiosInstance("assignment");
}

export function useGetAssignments() {
  return useQuery("get-assignments", getAssignments, {
    select: (data): Assignment[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function getMyAssignments(): Promise<AxiosResponse<Assignment[]>> {
  return authAxiosInstance("assignment/my");
}

export function useGetMyAssignments() {
  return useQuery("get-my-assignments", getMyAssignments, {
    select: (data): Assignment[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function createAssignments(bulkAssignment: BulkAssignment) {
  return authAxiosInstance.post("assignment", bulkAssignment);
}

export function useCreateAssignments() {
  const queryClient = useQueryClient();
  return useMutation(createAssignments, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-assignments");
      queryClient.invalidateQueries("get-userassignedlabs");
      queryClient.invalidateQueries("get-my-assignments");
    },
  });
}

function createMyAssignments(bulkAssignment: BulkAssignment) {
  return authAxiosInstance.post("assignment/my", bulkAssignment);
}

export function useCreateMyAssignments() {
  const queryClient = useQueryClient();
  return useMutation(createMyAssignments, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-assignments");
      queryClient.invalidateQueries("get-userassignedlabs");
      queryClient.invalidateQueries("get-my-assignments");
    },
  });
}

function deleteAssignment(bulkAssignment: string[]) {
  return authAxiosInstance.delete(`assignment`, { data: bulkAssignment });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation(deleteAssignment, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-assignments");
      queryClient.invalidateQueries("get-userassignedlabs");
      queryClient.invalidateQueries("get-my-assignments");
    },
  });
}

function deleteMyAssignment(bulkAssignment: string[]) {
  return authAxiosInstance.delete(`assignment/my`, { data: bulkAssignment });
}

export function useDeleteMyAssignment() {
  const queryClient = useQueryClient();
  return useMutation(deleteMyAssignment, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-assignments");
      queryClient.invalidateQueries("get-userassignedlabs");
      queryClient.invalidateQueries("get-my-assignments");
    },
  });
}

function getUserAssignedLabs(): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance.get("assignment/labs/my");
}

export function useGetUserAssignedLabs() {
  return useQuery("get-userassignedlabs", getUserAssignedLabs, {
    select: (data): Lab[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function getAssignmentsByUserId(
  userId: string
): Promise<AxiosResponse<Assignment[]>> {
  return authAxiosInstance.get(`assignment/user/${userId}`);
}

export function useGetAssignmentsByUserId(userId: string) {
  return useQuery(
    ["get-assignments-by-user-id", userId],
    () => getAssignmentsByUserId(userId),
    {
      select: (data): Assignment[] => {
        return data.data;
      },
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
}

function getAssignmentsByLabId(
  labId: string
): Promise<AxiosResponse<Assignment[]>> {
  return authAxiosInstance.get(`assignment/lab/${labId}`);
}

export function useGetAssignmentsByLabId(labId: string) {
  return useQuery(
    ["get-assignments-by-lab-id", labId],
    () => getAssignmentsByLabId(labId),
    {
      select: (data): Assignment[] => {
        return data.data;
      },
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
}

function getAllReadinessLabsRedacted(): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance.get("assignment/labs");
}

export function useGetAllReadinessLabsRedacted() {
  return useQuery(
    "get-all-readiness-labs-redacted",
    getAllReadinessLabsRedacted,
    {
      select: (data): Lab[] => {
        return data.data;
      },
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
}

function getReadinessLabsRedactedByUserId(
  userId: string
): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance.get(`assignment/labs/${userId}`);
}

export function useGetReadinessLabsRedactedByUserId(userId: string) {
  return useQuery(
    ["get-readiness-labs-redacted-by-user-id", userId],
    () => getReadinessLabsRedactedByUserId(userId),
    {
      select: (data): Lab[] => {
        return data.data;
      },
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
}
