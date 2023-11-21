import axios, { AxiosError, AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Assignment, Lab } from "../dataStructures";
import { authAxiosInstance, axiosInstance } from "../utils/axios-interceptors";

function getAssignments(): Promise<AxiosResponse<Assignment[]>> {
  return authAxiosInstance("assignment");
}

export function useGetAssignments() {
  return useQuery("get-assignments", getAssignments, {
    select: (data): Assignment[] => {
      return data.data;
    },
  });
}

function createAssignment(assignment: Assignment) {
  return authAxiosInstance.post("assignment", assignment);
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation(createAssignment, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-assignments");
      queryClient.invalidateQueries("get-userassignedlabs");
    },
  });
}

function deleteAssignment(assignment: Assignment) {
  return authAxiosInstance.delete(`assignment`, { data: assignment });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation(deleteAssignment, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-assignments");
      queryClient.invalidateQueries("get-userassignedlabs");
    },
  });
}

function getUserAssignedLabs(): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance.get("assignment/my");
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
