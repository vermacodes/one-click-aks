import { UseQueryResult } from "react-query";
import { Lab, LabType } from "../dataStructures";
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
    labType: LabType;
  };
  const getLabsByType = ({ labType }: GetLabsByTypeProps) => {
    // this is to tackle the mockcase and mockcases issue
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
