import { useContext } from "react";
import { WebSocketContext } from "../../../../Context/WebSocketContext";
import { defaultServiceMesh } from "../../../../../defaults";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import BuilderContainer from "../../../../UserInterfaceComponents/BuilderContainer";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { useSetLogs } from "../../../../../hooks/useLogs";
import { Lab } from "../../../../../dataStructures";

type Props = {
  index: number;
};

export default function ServiceMesh({ index }: Props) {
  const {
    data: lab,
    isLoading: labIsLoading,
    isFetching: labIsFetching,
  } = useLab();
  const { mutate: setLogs } = useSetLogs();
  const { mutate: setLab } = useSetLab();
  const { actionStatus } = useContext(WebSocketContext);

  // If there are no kubernetesClusters, return a disabled Checkbox
  if (!lab?.template?.kubernetesClusters?.length) {
    return (
      <Checkbox
        checked={false}
        disabled={true}
        handleOnChange={() => {}}
        id="serviceMesh"
        label="Service Mesh (Istio)"
        key={"serviceMesh"}
      />
    );
  }

  // Set serviceMesh to defaultServiceMesh if it's undefined or null
  const serviceMesh =
    lab.template.kubernetesClusters[index].addons.serviceMesh ??
    defaultServiceMesh;

  // Function to update the lab and logs state
  function setLabAndLogs(lab: Lab | undefined): void {
    if (lab === undefined) {
      return;
    }

    // Only update the logs if no action is in progress
    if (!actionStatus.inProgress) {
      setLogs({
        logs: JSON.stringify(lab.template, null, 4),
      });
    }

    // Update the lab state
    setLab(lab);
  }

  // Function to handle changes to the serviceMesh enabled state
  function handleServiceMeshChange() {
    if (serviceMesh) {
      serviceMesh.enabled = !serviceMesh.enabled;
      if (serviceMesh.enabled) {
        serviceMesh.mode = "Istio";
      }
      setLabAndLogs(lab);
    }
  }

  // Function to handle changes to the ingress gateway state
  function handleIngressGatewayChange(type: "internal" | "external") {
    if (serviceMesh?.enabled) {
      if (type === "internal") {
        serviceMesh.internalIngressGatewayEnabled =
          !serviceMesh.internalIngressGatewayEnabled;
      } else if (type === "external") {
        serviceMesh.externalIngressGatewayEnabled =
          !serviceMesh.externalIngressGatewayEnabled;
      }
      setLabAndLogs(lab);
    }
  }

  return (
    <>
      <Checkbox
        checked={serviceMesh.enabled}
        disabled={labIsLoading || labIsFetching}
        handleOnChange={handleServiceMeshChange}
        id="serviceMesh"
        label="Service Mesh (Istio)"
        key={"serviceMesh"}
      />
      {serviceMesh.enabled && (
        <BuilderContainer title="Service Mesh (Istio)">
          <div className={`mt-4 flex flex-wrap gap-x-2 gap-y-2`}>
            <Checkbox
              checked={serviceMesh.internalIngressGatewayEnabled}
              disabled={!serviceMesh.enabled || labIsLoading || labIsFetching}
              handleOnChange={() => handleIngressGatewayChange("internal")}
              id="serviceMeshInternalGateway"
              label="Internal Ingress Gateway"
              key={"serviceMeshInternalGateway"}
            />
            <Checkbox
              checked={serviceMesh.externalIngressGatewayEnabled}
              disabled={!serviceMesh.enabled || labIsLoading || labIsFetching}
              handleOnChange={() => handleIngressGatewayChange("external")}
              id="serviceMeshExternalGateway"
              label="External Ingress Gateway"
              key={"serviceMeshExternalGateway"}
            />
          </div>
        </BuilderContainer>
      )}
    </>
  );
}
