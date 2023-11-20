import { useMutation, useQuery, useQueryClient } from "react-query";

import { axiosInstance } from "../utils/axios-interceptors";
import { DeploymentType } from "../dataStructures";
import { AxiosResponse } from "axios";

function listDeployments(): Promise<AxiosResponse<DeploymentType[]>> {
  return axiosInstance.get(`deployments/my`);
}

function addDeployment(deployment: DeploymentType) {
  return axiosInstance.post(`deployments`, deployment);
}

function patchDeployment(deployment: DeploymentType) {
  return axiosInstance.patch(`deployments`, deployment);
}

function upsertDeployment(deployment: DeploymentType) {
  return axiosInstance.put(`deployments`, deployment);
}

function selectDeployment(deployment: DeploymentType) {
  return axiosInstance.put(`deployments/select`, deployment);
}

// function deleteDeployment(deployment: DeploymentType) {
//   return axiosInstance.delete(`deployments`, { data: deployment });
// }

export function useGetMyDeployments() {
  return useQuery("list-deployments", listDeployments, {
    select: (data): DeploymentType[] => {
      return data.data;
    },
    staleTime: 120000,
    cacheTime: 120000,
  });
}

export function useAddDeployment() {
  const queryClient = useQueryClient();
  return useMutation(addDeployment, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-deployments");
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function useSelectDeployment() {
  const queryClient = useQueryClient();
  return useMutation(selectDeployment, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-deployments");
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

export function usePatchDeployment() {
  const queryClient = useQueryClient();
  return useMutation(patchDeployment, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-deployments");
    },
  });
}

//TODO: Strong candidate for optimistic updates.
export function useUpsertDeployment() {
  const queryClient = useQueryClient();
  return useMutation(upsertDeployment, {
    onSuccess: () => {
      queryClient.invalidateQueries("list-deployments");
      queryClient.invalidateQueries("list-terraform-workspaces");
      queryClient.invalidateQueries("get-selected-terraform-workspace");
      queryClient.invalidateQueries("get-resources");
    },
  });
}

// delete deployment
export function useDeleteDeployment() {
  const queryClient = useQueryClient();
  return useMutation(
    (params: [string, string, string]) =>
      axiosInstance.delete(
        `deployments/${params[0]}/${params[1]}/${params[2]}`
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("list-deployments");
        queryClient.invalidateQueries("list-terraform-workspaces");
        queryClient.invalidateQueries("get-selected-terraform-workspace");
        queryClient.invalidateQueries("get-resources");
      },
    }
  );
}
