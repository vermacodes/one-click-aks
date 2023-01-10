import { TfvarKubernetesClusterType } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useLab, useSetLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import { useGetOrchestrators } from "../../../hooks/useOrchestrators";
import Checkbox from "../../Checkbox";
import { defaultTfvarConfig } from "../defaults";

export default function KubernetesCluster() {
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLab } = useSetLab();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  const { data: kubernetesVersion } = useGetOrchestrators();

  // The default value that kubernetes cluster will carry.
  function defaultValue(): TfvarKubernetesClusterType {
    var defaultVersion = "";
    kubernetesVersion?.orchestrators.forEach((o) => {
      if (o.default) {
        defaultVersion = o.orchestratorVersion;
      }
    });

    return {
      kubernetesVersion: defaultVersion,
      networkPlugin: "kubenet",
      networkPolicy: "null",
      networkPluginMode: "null",
      outboundType: "loadBalancer",
      privateClusterEnabled: "false",
      addons: {
        appGateway: false,
        microsoftDefender: false,
      },
      defaultNodePool: {
        enableAutoScaling: false,
        minCount: 1,
        maxCount: 1,
      },
    };
  }

  function handleOnChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (lab.template.kubernetesClusters.length === 0) {
          lab.template.kubernetesClusters = [defaultValue()];
        } else {
          lab.template.kubernetesClusters = [];
        }
        !inProgress &&
          setLogs({
            isStreaming: false,
            logs: JSON.stringify(lab.template, null, 4),
          });
        setLab(lab);
      }
    }
  }

  if (lab === undefined || lab.template === undefined) {
    return <></>;
  }

  if (labIsLoading || labIsFetching) {
    return (
      <Checkbox
        id="toggle-aks"
        label="AKS"
        disabled={true}
        checked={false}
        handleOnChange={handleOnChange}
      />
    );
  }

  return (
    <>
      {lab && lab.template && (
        <Checkbox
          id="toggle-aks"
          label="AKS"
          checked={lab.template.kubernetesClusters.length > 0}
          disabled={labIsLoading || labIsFetching}
          handleOnChange={handleOnChange}
        />
      )}
    </>
  );
}
