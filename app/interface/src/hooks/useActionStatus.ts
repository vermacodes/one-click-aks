import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ActionStatusType } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getActionStatus() {
  return axiosInstance.get("actionstatus");
}

function setActionStatus(actionStatus: ActionStatusType) {
  return axiosInstance.put("actionstatus", actionStatus);
}

export function useActionStatus() {
  const [refetchInterval, setRefetchInterval] = useState<false | number>(false);
  return useQuery("get-action-status", getActionStatus, {
    refetchInterval: refetchInterval,
    select: (data) => {
      if (data.data !== undefined) {
        return data.data.inProgress;
      }
      return;
    },
    onSuccess: (data: boolean) => {
      if (data) {
        setRefetchInterval(2000);
      } else {
        setRefetchInterval(false);
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
