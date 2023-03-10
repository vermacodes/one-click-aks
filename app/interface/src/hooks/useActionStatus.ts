import { AxiosResponse } from "axios";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ActionStatusType, TerraformOperation } from "../dataStructures";
import { axiosInstance } from "../utils/axios-interceptors";

function getActionStatus() {
  return axiosInstance.get("actionstatus");
}

function setActionStatus(actionStatus: ActionStatusType) {
  return axiosInstance.put("actionstatus", actionStatus);
}

export function useActionStatus() {
  const [refetchInterval, setRefecthInterval] = useState<false | number>(false);
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

function getTerraformOperation(id: string): Promise<AxiosResponse<TerraformOperation>> {
  return axiosInstance.get(`terraformoperation/${id}`);
}

export function useGetTerraformOperation(operationId: string) {
  const [refetchInterval, setRefecthInterval] = useState<false | number>(false);
  return useQuery(["get-terraform-operation", operationId], () => getTerraformOperation(operationId), {
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: true,
    select : (data): TerraformOperation => {
        return data.data;
    },
    onSuccess: (data: TerraformOperation ) => {
      if (data.operationStatus === "inprogress") {
        setRefecthInterval(5000);
      } else {
        setRefecthInterval(false);
      }
    },
    enabled: operationId !== "",
    staleTime: 2000,
  });
}