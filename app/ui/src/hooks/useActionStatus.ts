import axios from "axios";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ActionStatusType } from "../dataStructures";

function getActionStatus() {
    return axios.get("http://localhost:8080/actionstatus");
}

function setActionStatus(actionStatus: ActionStatusType) {
    return axios.post("http://localhost:8080/actionstatus", actionStatus);
}

export function useActionStatus() {
    const [refetchInterval, setRefecthInterval] = useState<false | number>(false);
    const queryClient = useQueryClient();
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
