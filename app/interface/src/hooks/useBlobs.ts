import { useQuery } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";

function getSharedTemplates() {
    return axiosInstance("sharedtemplates");
}

export function useSharedTemplates() {
    return useQuery("shared-templates", getSharedTemplates, {
        select: (data) => {
            return data.data.blob;
        },
        cacheTime: 10000,
        staleTime: 10000,
    });
}

function getSharedLabs() {
    return axiosInstance.get(`listlabs`);
}

export function useSharedLabs() {
    return useQuery("shared-labs", getSharedLabs, {
        select: (data) => {
            return data.data.blob;
        },
        cacheTime: 10000,
        staleTime: 10000,
    });
}
