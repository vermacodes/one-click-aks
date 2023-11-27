import { useContext } from "react";
import { Lab } from "../../../../../dataStructures";
import { defaultServiceMesh } from "../../../../../defaults";
import { useSetLogs } from "../../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../../Context/WebSocketContext";
import BuilderContainer from "../../../../UserInterfaceComponents/BuilderContainer";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";

type Props = {
  index: number;
};

export default function ServiceMesh({ index }: Props) {
  const { lab, setLab } = useGlobalStateContext();
  const { mutate: setLogs } = useSetLogs();
  const { actionStatus } = useContext(WebSocketContext);

  const newLab = { ...lab };
  // If there are no kubernetesClusters, return a disabled Checkbox
  if (!newLab?.template?.kubernetesClusters?.length) {
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
    newLab.template.kubernetesClusters[index].addons.serviceMesh ??
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
      setLabAndLogs(newLab);
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
      setLabAndLogs(newLab);
    }
  }

  return (
    <>
      <Checkbox
        checked={serviceMesh.enabled}
        disabled={false}
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
              disabled={!serviceMesh.enabled}
              handleOnChange={() => handleIngressGatewayChange("internal")}
              id="serviceMeshInternalGateway"
              label="Internal Ingress Gateway"
              key={"serviceMeshInternalGateway"}
            />
            <Checkbox
              checked={serviceMesh.externalIngressGatewayEnabled}
              disabled={!serviceMesh.enabled}
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
