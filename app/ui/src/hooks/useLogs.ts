import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { LogsStreamType } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getLogs() {
    return axiosInstance.get("logs");
}

function setLogs(log: LogsStreamType) {
    return axiosInstance.post("logs", log);
}

export function useLogs() {
    const [refetchInterval, setRefecthInterval] = useState<false | number>(false);
    return useQuery("get-logs", getLogs, {
        refetchInterval: refetchInterval,
        select: (data) => {
            return data.data;
        },
        onSuccess: (data: LogsStreamType) => {
            if (data.isStreaming) {
                setRefecthInterval(1000);
            } else {
                setRefecthInterval(false);
            }
        },
    });
}

export function useSetLogs() {
    const queryClient = useQueryClient();
    return useMutation(setLogs, {
        onSuccess: () => {
            queryClient.invalidateQueries("get-logs");
        },
    });
}
