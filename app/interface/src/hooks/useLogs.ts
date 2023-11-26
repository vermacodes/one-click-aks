import { useMutation, useQueryClient } from "react-query";
import { LogsStreamType } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function setLogs(log: LogsStreamType) {
  return axiosInstance.put("logs", log);
}

export function useSetLogs() {
  const queryClient = useQueryClient();
  return useMutation(setLogs, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-logs");
    },
  });
}

function appendLogs(log: string) {
  return axiosInstance.put("logs/append", log);
}

export function useAppendLogs() {
  const queryClient = useQueryClient();
  return useMutation(appendLogs, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-logs");
    },
  });
}

function clearLogs() {
  return axiosInstance.delete("logs");
}

export function useClearLogs() {
  const queryClient = useQueryClient();
  return useMutation(clearLogs, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-logs");
    },
  });
}
