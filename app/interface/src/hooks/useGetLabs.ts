import { UseQueryResult } from "react-query";
import { Lab } from "../dataStructures";
import {
  useReadinessLabs,
  useSharedMockCases,
  useSharedTemplates,
  useTemplates,
} from "./useBlobs";
import { useGetUserAssignedLabs } from "./useAssignment";

export function useGetLabs() {
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
    assignments: useGetUserAssignedLabs(),
  };

  type GetLabsByTypeProps = {
    labType: string;
  };
  const getLabsByType = ({ labType }: GetLabsByTypeProps) => {
    const dataSource = dataSources[labType];
    const { data: labs, isLoading, isFetching } = dataSource;
    return {
      labs,
      isLoading,
      isFetching,
    };
  };

  type GetLabByTypeAndIdProps = {
    labType: string;
    labId: string;
  };
  const getLabByTypeAndId = ({ labType, labId }: GetLabByTypeAndIdProps) => {
    // appending 's' to the labType
    labType = labType + "s";
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
