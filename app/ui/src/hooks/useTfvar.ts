import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { TfvarConfigType } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getTfvar() {
    return axiosInstance.get("tfvar");
}

function setTfvar(tfvar: TfvarConfigType) {
    return axiosInstance.post("tfvar", tfvar);
}

function setDefaultTfvar() {
    return axiosInstance.post("tfvardefault");
}

export function useTfvar() {
    const queryClient = useQueryClient();
    return useQuery("get-tfvar", getTfvar, {
        select: (data: AxiosResponse) => {
            if (data.data === undefined) {
                setDefaultTfvar();
                queryClient.invalidateQueries("get-tfvar");
            }
            return data.data;
        },
        onError: (error) => {
            console.log(error);
        },
    });
}

export function useSetTfvar() {
    const queryClient = useQueryClient();
    return useMutation(setTfvar, {
        onSuccess: () => {
            queryClient.invalidateQueries("get-tfvar");
            queryClient.invalidateQueries("get-logs");
        },
    });
}
