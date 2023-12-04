import { AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Challenge, Lab } from "../dataStructures";
import { authAxiosInstance } from "../utils/axios-interceptors";

function getChallenges(): Promise<AxiosResponse<Challenge[]>> {
  return authAxiosInstance("challenge");
}

export function useGetChallenges() {
  return useQuery("get-challenges", getChallenges, {
    select: (data): Challenge[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function getMyChallenges(): Promise<AxiosResponse<Challenge[]>> {
  return authAxiosInstance("challenge/my");
}

export function useGetMyChallenges() {
  return useQuery("get-my-challenges", getMyChallenges, {
    select: (data): Challenge[] => {
      return data.data;
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}

function upsertChallenges(challenges: Challenge[]) {
  return authAxiosInstance.post("challenge", challenges);
}

export function useUpsertChallenges() {
  const queryClient = useQueryClient();
  return useMutation(upsertChallenges, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-challenges");
      queryClient.invalidateQueries("get-my-challenge-labs-redacted");
      queryClient.invalidateQueries("get-my-challenges");
    },
  });
}

function deleteChallenge(challengeId: string) {
  return authAxiosInstance.delete(`challenge/${challengeId}`);
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation(deleteChallenge, {
    onSuccess: () => {
      queryClient.invalidateQueries("get-challenges");
      queryClient.invalidateQueries("get-my-challenge-labs-redacted");
      queryClient.invalidateQueries("get-my-challenges");
    },
  });
}

function getChallengesByLabId(
  labId: string
): Promise<AxiosResponse<Challenge[]>> {
  return authAxiosInstance.get(`challenge/lab/${labId}`);
}

export function useGetChallengesByLabId(labId: string) {
  return useQuery(
    ["get-challenges-by-lab-id", labId],
    () => getChallengesByLabId(labId),
    {
      select: (data): Challenge[] => {
        return data.data;
      },
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!labId,
    }
  );
}

function getAllChallengeLabsRedacted(): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance.get("challenge/labs");
}

export function useGetAllChallengeLabsRedacted() {
  return useQuery(
    "get-all-challenge-labs-redacted",
    getAllChallengeLabsRedacted,
    {
      select: (data): Lab[] => {
        return data.data;
      },
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
}

function getMyChallengeLabsRedacted(): Promise<AxiosResponse<Lab[]>> {
  return authAxiosInstance.get(`challenge/labs/my`);
}

export function useGetMyChallengeLabsRedacted() {
  return useQuery(
    "get-my-challenge-labs-redacted",
    getMyChallengeLabsRedacted,
    {
      select: (data): Lab[] => {
        return data.data;
      },
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
}
