import { useMutation, useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "../utils/axios-interceptors";
import { Lab } from "../dataStructures";
import { AxiosError, AxiosResponse } from "axios";

function getLab(): Promise<AxiosResponse<Lab>> {
  return axiosInstance.get("lab");
}

function setLab(lab: Lab) {
  return axiosInstance.put("lab", lab);
}

function deleteLab(): Promise<AxiosResponse> {
  return axiosInstance.delete("lab/redis");
}

export function useLab() {
  return useQuery("get-lab", getLab, {
    select: (data): Lab => {
      return data.data;
    },
  });
}

export function useSetLab() {
  const queryClient = useQueryClient();
  return useMutation(setLab, {
    onMutate: async (newLab) => {
      // Snapshot the previous value
      const previousLab = queryClient.getQueryData("get-lab");

      // Optimistically update to the new value
      queryClient.setQueryData("get-lab", newLab);

      // Return the snapshot value for use in onError
      return { previousLab };
    },
    onError: (err, newLab, context) => {
      // Roll back to the previous value if the mutation fails
      queryClient.setQueryData("get-lab", context?.previousLab);
    },
    onSettled: () => {
      // Invalidate the query to refetch it after the mutation succeeds
      queryClient.invalidateQueries("get-lab");
    },
  });
}

export function useDeleteLab() {
  var queryClient = useQueryClient();
  return useMutation(deleteLab, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-lab");
    },
  });
}
