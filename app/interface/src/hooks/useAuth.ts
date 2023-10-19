import { useMutation, useQuery, useQueryClient } from "react-query";
import { RoleMutation, Roles, TerraformOperation } from "../dataStructures";
import { authAxiosInstance } from "../utils/axios-interceptors";

function getRoles(userPrincipal: string | undefined): Promise<Roles> {
  return typeof userPrincipal === undefined
    ? Promise.reject(new Error("usePrincipal Required"))
    : authAxiosInstance.get(`roles/${userPrincipal}`).then((res) => res.data);
}

export function useGetRoles(userPrincipal: string) {
  return useQuery({
    queryKey: ["roles", userPrincipal],
    queryFn: () => getRoles(userPrincipal),
    enabled: userPrincipal !== undefined,
  });
}

function getMyRoles(): Promise<Roles> {
  return authAxiosInstance.get(`roles/my`).then((res) => res.data);
}

export function useGetMyRoles() {
  return useQuery({
    queryKey: "myRoles",
    queryFn: () => getMyRoles(),
  });
}

function getAllRoles(): Promise<Roles[]> {
  return authAxiosInstance.get(`roles`).then((res) => res.data);
}

export function useGetAllRoles() {
  return useQuery({
    queryKey: "allRoles",
    queryFn: () => getAllRoles(),
  });
}

function removeRole(role: RoleMutation): Promise<Roles> {
  return authAxiosInstance
    .delete(`roles/${role.userPrincipal}/${role.role}`)
    .then((res) => res.data);
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  return useMutation(removeRole, {
    onSuccess: () => {
      queryClient.invalidateQueries("allRoles");
      queryClient.invalidateQueries("myRoles");
    },
  });
}

function addRole(role: RoleMutation): Promise<Roles> {
  return authAxiosInstance
    .post(`roles/${role.userPrincipal}/${role.role}`)
    .then((res) => res.data);
}

export function useAddRole() {
  const queryClient = useQueryClient();
  return useMutation(addRole, {
    onSuccess: () => {
      queryClient.invalidateQueries("allRoles");
      queryClient.invalidateQueries("myRoles");
    },
  });
}

function addDefaultRoles(): Promise<Roles> {
  return authAxiosInstance.post(`roles/default`).then((res) => res.data);
}

export function useAddDefaultRoles() {
  const queryClient = useQueryClient();
  return useMutation(addDefaultRoles, {
    onSuccess: () => {
      queryClient.invalidateQueries("allRoles");
      queryClient.invalidateQueries("myRoles");
    },
  });
}

function operationRecord(operationRecord: TerraformOperation) {
  return authAxiosInstance.post(`logging/operation`, operationRecord)
}

export function useOperationRecord() {
  return useMutation(operationRecord, {
  });
}