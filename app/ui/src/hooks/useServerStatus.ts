import { useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";

function getServerStatus() {
    return axiosInstance.get("status");
}

export function useServerStatus() {
    return useQuery("server-status", getServerStatus, {
        select: (data) => {
            return data.data.status;
        },
    });
}

export function useInvalidateServerStatus() {
    const queryClient = useQueryClient();
    queryClient.invalidateQueries("server-status");
}
