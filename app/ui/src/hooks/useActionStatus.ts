import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ActionStatusType } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getActionStatus() {
    return axiosInstance.get("actionstatus");
}

function setActionStatus(actionStatus: ActionStatusType) {
    return axiosInstance.post("actionstatus", actionStatus);
}

export function useActionStatus() {
    const [refetchInterval, setRefecthInterval] = useState<false | number>(false);
    return useQuery("get-action-status", getActionStatus, {
        refetchInterval: refetchInterval,
        select: (data) => {
            return data.data.inProgress;
        },
        onSuccess: (data: boolean) => {
            if (data) {
                setRefecthInterval(2000);
            } else {
                setRefecthInterval(false);
            }
        },
    });
}

export function useSetActionStatus() {
    const queryClient = useQueryClient();
    return useMutation(setActionStatus, {
        onSuccess: () => {
            queryClient.invalidateQueries("get-action-status");
        },
    });
}
