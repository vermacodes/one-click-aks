import axios from "axios";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { LogsStreamType } from "../dataStructures";

function getLogs() {
    return axios.get("http://localhost:8080/logs");
}

function setLogs(log: LogsStreamType) {
    return axios.post("http://localhost:8080/logs", log);
}

export function useLogs() {
    const [refetchInterval, setRefecthInterval] = useState<false | number>(false);
    return useQuery("get-logs", getLogs, {
        refetchInterval: refetchInterval,
        select: (data) => {
            return data.data;
        },
        onSuccess: (data: LogsStreamType) => {
            console.log(data);
            if (data.isStreaming) {
                setRefecthInterval(2000);
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
