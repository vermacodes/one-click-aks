import { useState } from "react";
import { UseQueryResult } from "react-query";
import { Lab, LabType } from "../dataStructures";
import { useGetReadinessLabsRedactedByUserId } from "./useAssignment";
import {
  useChallengeLabs,
  usePrivateLabs,
  useReadinessLabs,
  useSharedMockCases,
  useSharedTemplates,
  useTemplates,
} from "./useBlobs";

export function useGetLabs() {
  const [userId, setUserId] = useState<string>("my");
  type DataSourceType = UseQueryResult<Lab[], unknown>;

  type DataSourcesType = {
    [key: string]: DataSourceType;
  };

  const dataSources: DataSourcesType = {
    privatelab: usePrivateLabs(),
    publiclab: useSharedTemplates(),
    mockcase: useSharedMockCases(),
    mylabs: useTemplates(), // Deprecated
    template: useTemplates(),
    readinesslab: useReadinessLabs(),
    challengelab: useChallengeLabs(),
    assignment: useGetReadinessLabsRedactedByUserId(userId),
  };

  type GetLabsByTypeProps = {
    labType: LabType;
    userId?: string;
  };
  const getLabsByType = ({ labType, userId = "my" }: GetLabsByTypeProps) => {
    // this is to tackle the mockcase and mockcases issue
    if (userId !== "my") {
      setUserId(userId);
    }

    const dataSource = dataSources[labType];
    const { data: labs, isLoading, isFetching } = dataSource;
    return {
      labs,
      isLoading,
      isFetching,
    };
  };

  type GetLabByTypeAndIdProps = {
    labType: LabType;
    labId: string;
  };
  const getLabByTypeAndId = ({ labType, labId }: GetLabByTypeAndIdProps) => {
    const { labs, isLoading, isFetching } = getLabsByType({ labType });
    const lab = labs?.find((lab) => lab.id === labId);
    return {
      lab,
      isLoading,
      isFetching,
    };
  };

  return { getLabsByType, getLabByTypeAndId };
}
