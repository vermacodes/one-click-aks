import { useQuery } from "react-query";
import { Roles } from "../dataStructures";
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
  })
}
