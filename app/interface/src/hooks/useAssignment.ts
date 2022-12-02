import axios, { AxiosError, AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Assignment, Lab } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getAssignments(): Promise<AxiosResponse<Assignment[]>> {
  return axiosInstance("assignments");
}

export function useGetAssignments() {
  return useQuery("get-assignments", getAssignments, {
    select: (data): Assignment[] => {
      return data.data;
    },
  });
}

function createAssignment(assignment: Assignment) {
  return axiosInstance.post("assignment", assignment);
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation(createAssignment, {
    onSuccess: () => {
      queryClient.invalidateQueries("assignment");
      queryClient.invalidateQueries("get-userassignedlabs");
    },
  });
}

function deleteAssignment(assignment: Assignment) {
  return axiosInstance.delete(`assignment/${assignment.id}`);
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
  return axiosInstance.get("userassignedlabs");
}

export function useGetUserAssignedLabs() {
  return useQuery("get-userassignedlabs", getUserAssignedLabs, {
    select: (data): Lab[] => {
      return data.data;
    },
  });
}
