import { useMutation, useQuery, useQueryClient } from "react-query";

import { axiosInstance } from "../utils/axios-interceptors";
import { DeploymentType } from "../dataStructures";

function listDeployments() {
    return axiosInstance.get(`deployments/my`);
}

function addDeployment(deployment: DeploymentType) {
    return axiosInstance.post(`deployments`, deployment);
}

function upsertDeployment(deployment: DeploymentType) {
    return axiosInstance.put(`deployments`, deployment);
}

export function useGetMyDeployments() {
    return useQuery("list-deployments", listDeployments, {
        select: (data) => {
            return data.data;
        },
        staleTime: 6000000,
        cacheTime: 6000000,
    });
}

export function useAddDeployment() {
    const queryClient = useQueryClient();
    return useMutation(addDeployment, {
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
        },
    });
}