import { useMutation, useQuery, useQueryClient } from "react-query";
import { Profile, ProfileMutation } from "../dataStructures";
import { authAxiosInstance } from "../utils/axios-interceptors";

function getProfile(userPrincipal: string | undefined): Promise<Profile> {
  return typeof userPrincipal === undefined
    ? Promise.reject(new Error("usePrincipal Required"))
    : authAxiosInstance
        .get(`profiles/${userPrincipal}`)
        .then((res) => res.data);
}

export function useGetProfile(userPrincipal: string) {
  return useQuery({
    queryKey: ["profiles", userPrincipal],
    queryFn: () => getProfile(userPrincipal),
    enabled: userPrincipal !== undefined,
  });
}

function getMyProfile(): Promise<Profile> {
  return authAxiosInstance.get(`profiles/my`).then((res) => res.data);
}

export function useGetMyProfile() {
  return useQuery({
    queryKey: "myProfile",
    queryFn: () => getMyProfile(),
  });
}

function getAllProfiles(): Promise<Profile[]> {
  return authAxiosInstance.get(`profiles`).then((res) => res.data);
}

export function useGetAllProfiles() {
  return useQuery({
    queryKey: "allProfiles",
    queryFn: () => getAllProfiles(),
  });
}

function removeRole(role: ProfileMutation): Promise<Profile> {
  return authAxiosInstance
    .delete(`profiles/${role.userPrincipal}/${role.role}`)
    .then((res) => res.data);
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  return useMutation(removeRole, {
    onSuccess: () => {
      queryClient.invalidateQueries("allProfiles");
      queryClient.invalidateQueries("myProfile");
    },
  });
}

function addRole(role: ProfileMutation): Promise<Profile> {
  return authAxiosInstance
    .post(`profiles/${role.userPrincipal}/${role.role}`)
    .then((res) => res.data);
}

export function useAddRole() {
  const queryClient = useQueryClient();
  return useMutation(addRole, {
    onSuccess: () => {
      queryClient.invalidateQueries("allProfiles");
      queryClient.invalidateQueries("myProfile");
    },
  });
}

function createProfile(profile: Profile) {
  return authAxiosInstance.post(`profiles`, profile);
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation(createProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries("allProfiles");
      queryClient.invalidateQueries("myProfile");
    },
  });
}
