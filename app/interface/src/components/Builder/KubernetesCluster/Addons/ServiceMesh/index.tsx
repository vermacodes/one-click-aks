import { useContext } from "react";
import { WebSocketContext } from "../../../../../WebSocketContext";
import { defaultServiceMesh } from "../../../../../defaults";
import { useLab, useSetLab } from "../../../../../hooks/useLab";
import BuilderContainer from "../../../../UserInterfaceComponents/BuilderContainer";
import Checkbox from "../../../../UserInterfaceComponents/Checkbox";
import { useSetLogs } from "../../../../../hooks/useLogs";
import { Lab } from "../../../../../dataStructures";

export default function ServiceMesh() {
  const { data: lab } = useLab();
  const { mutate: setLogs } = useSetLogs();
  const { mutate: setLab } = useSetLab();
  const { actionStatus } = useContext(WebSocketContext);

  if (
    lab === undefined ||
    lab.template === undefined ||
    lab.template.kubernetesClusters === undefined ||
    lab.template.kubernetesClusters.length === 0
  ) {
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

  // if lab.template.kubernetesClusters[0].addons.serviceMesh is undefined, then set it to default value.
  if (
    lab.template.kubernetesClusters[0].addons.serviceMesh === undefined ||
    lab.template.kubernetesClusters[0].addons.serviceMesh === null
  ) {
    lab.template.kubernetesClusters[0].addons.serviceMesh = defaultServiceMesh;
  }

  function setLabAndLogs(lab: Lab) {
    !actionStatus.inProgress &&
      setLogs({
        logs: JSON.stringify(lab.template, null, 4),
      });
    setLab(lab);
  }

  // enable or disable service mesh
  // setLab(lab);
  function handleServiceMeshChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (lab.template.kubernetesClusters.length > 0) {
          if (
            lab.template.kubernetesClusters[0].addons.serviceMesh.enabled ===
            true
          ) {
            lab.template.kubernetesClusters[0].addons.serviceMesh.enabled =
              false;
          } else {
            lab.template.kubernetesClusters[0].addons.serviceMesh.enabled =
              true;
          }
          setLabAndLogs(lab);
        }
      }
    }
  }

  // if service mesh is enabled, then enable or disable internal and external ingress gateways
  // setLab(lab);
  function handleInternalIngressGatewayChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (lab.template.kubernetesClusters.length > 0) {
          if (lab.template.kubernetesClusters[0].addons.serviceMesh.enabled) {
            if (
              lab.template.kubernetesClusters[0].addons.serviceMesh
                .internalIngressGatewayEnabled === true
            ) {
              lab.template.kubernetesClusters[0].addons.serviceMesh.internalIngressGatewayEnabled =
                false;
            } else {
              lab.template.kubernetesClusters[0].addons.serviceMesh.internalIngressGatewayEnabled =
                true;
            }
            setLabAndLogs(lab);
          }
        }
      }
    }
  }

  // if service mesh is enabled, then enable or disable internal and external ingress gateways
  // setLab(lab);
  function handleExternalIngressGatewayChange() {
    if (lab !== undefined) {
      if (lab.template !== undefined) {
        if (lab.template.kubernetesClusters.length > 0) {
          if (lab.template.kubernetesClusters[0].addons.serviceMesh.enabled) {
            if (
              lab.template.kubernetesClusters[0].addons.serviceMesh
                .externalIngressGatewayEnabled === true
            ) {
              lab.template.kubernetesClusters[0].addons.serviceMesh.externalIngressGatewayEnabled =
                false;
            } else {
              lab.template.kubernetesClusters[0].addons.serviceMesh.externalIngressGatewayEnabled =
                true;
            }
            setLabAndLogs(lab);
          }
        }
      }
    }
  }

  return (
    <>
      <Checkbox
        checked={lab.template.kubernetesClusters[0].addons.serviceMesh.enabled}
        disabled={false}
        handleOnChange={handleServiceMeshChange}
        id="serviceMesh"
        label="Service Mesh (Istio)"
        key={"serviceMesh"}
      />
      {lab.template.kubernetesClusters[0].addons.serviceMesh.enabled && (
        <>
          <BuilderContainer title="Service Mesh (Istio)">
            <div className={`mt-4 flex flex-wrap gap-x-2 gap-y-2`}>
              <Checkbox
                checked={
                  lab.template.kubernetesClusters[0].addons.serviceMesh
                    .internalIngressGatewayEnabled
                }
                disabled={
                  !lab.template.kubernetesClusters[0].addons.serviceMesh.enabled
                }
                handleOnChange={handleInternalIngressGatewayChange}
                id="serviceMeshInternalGateway"
                label="Internal Ingress Gateway"
                key={"serviceMeshInternalGateway"}
              />
              <Checkbox
                checked={
                  lab.template.kubernetesClusters[0].addons.serviceMesh
                    .externalIngressGatewayEnabled
                }
                disabled={
                  !lab.template.kubernetesClusters[0].addons.serviceMesh.enabled
                }
                handleOnChange={handleExternalIngressGatewayChange}
                id="serviceMeshExternalGateway"
                label="External Ingress Gateway"
                key={"serviceMeshExternalGateway"}
              />
            </div>
          </BuilderContainer>
        </>
      )}
    </>
  );
}
