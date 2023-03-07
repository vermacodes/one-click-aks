import { AxiosResponse } from "axios";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { LogsStreamType } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getLogs(): Promise<AxiosResponse<LogsStreamType>> {
  return axiosInstance.get("logs");
}

function setLogs(log: LogsStreamType) {
  return axiosInstance.put("logs", log);
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

function startStream() {
  return axiosInstance.put("logs/startstream");
}

export function useStartStream() {
  const queryClient = useQueryClient();
  return useMutation(startStream, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-logs");
    },
  });
}

function endStream() {
  return axiosInstance.put("logs/endstream");
}

export function useEndStream() {
  const queryClient = useQueryClient();
  return useMutation(endStream, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-logs");
    },
  });
}
