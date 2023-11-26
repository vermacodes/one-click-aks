import { UseQueryResult } from "react-query";
import { Lab, LabType } from "../dataStructures";
import {
  useReadinessLabs,
  useSharedMockCases,
  useSharedTemplates,
  useTemplates,
} from "./useBlobs";
import { useGetReadinessLabsRedactedByUserId } from "./useAssignment";
import { useState } from "react";

export function useGetLabs() {
  const [userId, setUserId] = useState<string>("my");
  type DataSourceType = UseQueryResult<Lab[], unknown>;

  type DataSourcesType = {
    [key: string]: DataSourceType;
  };

  const dataSources: DataSourcesType = {
    publiclabs: useSharedTemplates(),
    mockcases: useSharedMockCases(),
    mylabs: useTemplates(),
    templates: useTemplates(),
    readinesslabs: useReadinessLabs(),
    //readinesslabs: useSharedLabs(),
    assignments: useGetReadinessLabsRedactedByUserId(userId),
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

    const dataSource =
      dataSources[labType.endsWith("s") ? labType : labType + "s"];
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
