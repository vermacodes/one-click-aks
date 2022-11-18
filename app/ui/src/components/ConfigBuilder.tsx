import { useEffect, useReducer, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { TfvarConfigType } from "../dataStructures";
import { useActionStatus, useSetActionStatus } from "../hooks/useActionStatus";
import { useSetLogs } from "../hooks/useLogs";
import { axiosInstance } from "../utils/axios-interceptors";
import LabBuilder from "./LabBuilder";

interface ClusterConfigAction {
    type: string;
    fieldName: string;
    payload: string;
}

const defaultTfvarConfig: TfvarConfigType = {
    resourceGroup: {
        location: "East US",
    },
    kubernetesCluster: {
        networkPlugin: "azure",
        networkPolicy: "azure",
        privateClusterEnabled: "true",
        defaultNodePool: {
            enableAutoScaling: true,
            minCount: 1,
            maxCount: 1,
        },
    },
    virtualNetworks: [
        {
            addressSpace: ["10.1.0.0/16"],
        },
    ],
    subnets: [
        {
            addressPrefixes: ["10.1.1.0/24"],
            name: "AzureFirewallSubnet",
        },
        {
            addressPrefixes: ["10.1.2.0/24"],
            name: "JumpServerSubnet",
        },
        {
            addressPrefixes: ["10.1.3.0/24"],
            name: "KubernetesSubnet",
        },
    ],
    jumpservers: [
        {
            adminUsername: "aksadmin",
            adminPassword: "Password1234!",
        },
    ],
};

function tfvarConfigReducer(state: TfvarConfigType, action: ClusterConfigAction): TfvarConfigType {
    switch (action.type) {
        case "autoscaling": {
            return {
                ...state,
                kubernetesCluster: {
                    ...state.kubernetesCluster,
                    defaultNodePool: {
                        ...state.kubernetesCluster.defaultNodePool,
                        enableAutoScaling: !state.kubernetesCluster.defaultNodePool.enableAutoScaling,
                    },
                },
            };
        }
        case "azureCNI": {
            let networkPolicy = state.kubernetesCluster.networkPolicy;
            if (networkPolicy === "null") {
                networkPolicy = "azure";
            }

            return {
                ...state,
                kubernetesCluster: {
                    ...state.kubernetesCluster,
                    networkPlugin: "azure",
                    networkPolicy: networkPolicy,
                },
            };
        }
        case "kubenet": {
            const newState = { ...state };
            const newKubernetesCluster = { ...newState.kubernetesCluster };
            newKubernetesCluster.networkPlugin = "kubenet";
            newKubernetesCluster.networkPolicy = "null";
            newState.kubernetesCluster = newKubernetesCluster;
            return newState;
        }
        case "calico": {
            const newState = { ...state };
            const newKubernetesCluster = { ...newState.kubernetesCluster };
            if (newKubernetesCluster.networkPolicy === "calico") {
                newKubernetesCluster.networkPolicy = "azure";
            } else {
                newKubernetesCluster.networkPolicy = "calico";
            }
            newState.kubernetesCluster = newKubernetesCluster;
            return newState;
        }
        case "virtualNetworks": {
            if (state.virtualNetworks.length === 0) {
                return {
                    ...state,
                    virtualNetworks: defaultTfvarConfig.virtualNetworks,
                    subnets: defaultTfvarConfig.subnets,
                };
            }
            return {
                ...state,
                virtualNetworks: [],
                subnets: [],
                jumpservers: [],
            };
        }
        case "jumpservers": {
            if (state.virtualNetworks.length > 0) {
                if (state.jumpservers.length === 0) {
                    return {
                        ...state,
                        jumpservers: defaultTfvarConfig.jumpservers,
                    };
                }
                return {
                    ...state,
                    jumpservers: [],
                };
            }
            return state;
        }
        case "privateClusterEnabled": {
            const newState = { ...state };
            const newKubernetesCluster = { ...newState.kubernetesCluster };
            if (state.kubernetesCluster.privateClusterEnabled === "true") {
                newKubernetesCluster.privateClusterEnabled = "false";
                newState.kubernetesCluster = newKubernetesCluster;
                return {
                    ...newState,
                    jumpservers: [],
                };
            }
            newKubernetesCluster.privateClusterEnabled = "true";
            newState.kubernetesCluster = newKubernetesCluster;
            return newState;
        }
    }
    return state;
}

export default function ConfigBuilder() {
    const [showLabBuilder, setShowLabBuilder] = useState(false);
    const [tfvarConfig, tfvarDispatch] = useReducer(tfvarConfigReducer, defaultTfvarConfig);

    const { data: inProgress } = useActionStatus();
    const { mutate: setActionStatus } = useSetActionStatus();
    const { mutate: setLogs } = useSetLogs();

    useEffect(() => {
        !inProgress && setLogs({ isStreaming: false, logs: JSON.stringify(tfvarConfig, null, 4) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tfvarConfig]);

    function applyHandler() {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        axiosInstance.post("apply", tfvarConfig);
    }

    function planHandler() {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        axiosInstance.post("plan", tfvarConfig);
    }

    function destroyHandler() {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        axiosInstance.post("destroy", tfvarConfig);
    }

    function handleCreateLab() {
        setShowLabBuilder(true);
    }

    return (
        <>
            <Row style={{ textAlign: "left" }} className="mt-1">
                <Col>
                    <Form>
                        <div key="inline-switch-networkPlugin" className="mb-3">
                            <Form.Check
                                inline
                                label="Custom Vnet"
                                type="switch"
                                id="virtualNetworks"
                                value="virtualNetworks"
                                checked={tfvarConfig.virtualNetworks.length > 0}
                                onChange={(e) =>
                                    tfvarDispatch({
                                        type: "virtualNetworks",
                                        fieldName: "virtualNetworks",
                                        payload: e.currentTarget.value,
                                    })
                                }
                            />
                            <Form.Check
                                inline
                                label="Private Cluster"
                                type="switch"
                                id="privateClusterEnabled"
                                value="privateClusterEnabled"
                                checked={tfvarConfig.kubernetesCluster.privateClusterEnabled === "true"}
                                onChange={(e) =>
                                    tfvarDispatch({
                                        type: "privateClusterEnabled",
                                        fieldName: "privateClusterEnabled",
                                        payload: e.currentTarget.value,
                                    })
                                }
                            />
                            <Form.Check
                                inline
                                label="Jump Server"
                                type="switch"
                                id="jumpservers"
                                value="jumpservers"
                                disabled={
                                    tfvarConfig.virtualNetworks.length === 0 ||
                                    tfvarConfig.kubernetesCluster.privateClusterEnabled === "false"
                                }
                                checked={tfvarConfig.jumpservers.length > 0}
                                onChange={(e) =>
                                    tfvarDispatch({
                                        type: "jumpservers",
                                        fieldName: "jumpservers",
                                        payload: e.currentTarget.value,
                                    })
                                }
                            />
                            <Form.Check
                                inline
                                label="Azure CNI"
                                type="switch"
                                id="azureCNI"
                                value="azure"
                                checked={"azure" === tfvarConfig.kubernetesCluster.networkPlugin}
                                onChange={(e) =>
                                    tfvarDispatch({
                                        type: "azureCNI",
                                        fieldName: "networkPlugin",
                                        payload: e.currentTarget.value,
                                    })
                                }
                            />
                            <Form.Check
                                inline
                                label="Kubenet"
                                type="switch"
                                id="kubenet"
                                value="kubenet"
                                checked={"kubenet" === tfvarConfig.kubernetesCluster.networkPlugin}
                                onChange={(e) =>
                                    tfvarDispatch({
                                        type: "kubenet",
                                        fieldName: "networkPlugin",
                                        payload: e.currentTarget.value,
                                    })
                                }
                            />
                            <Form.Check
                                inline
                                label="Calico"
                                name="group2"
                                type="switch"
                                id="calico"
                                value="calico"
                                checked={"calico" === tfvarConfig.kubernetesCluster.networkPolicy}
                                disabled={
                                    tfvarConfig.kubernetesCluster.networkPlugin === "kubenet" ||
                                    tfvarConfig.kubernetesCluster.networkPolicy === "null"
                                }
                                onChange={(e) =>
                                    tfvarDispatch({
                                        type: "calico",
                                        fieldName: "networkPolicy",
                                        payload: e.currentTarget.value,
                                    })
                                }
                            />
                            <Form.Check
                                inline
                                label="Auto Scaling"
                                name="autoscaling"
                                type="switch"
                                id="autoscaling"
                                value="autoscaling"
                                checked={tfvarConfig.kubernetesCluster.defaultNodePool.enableAutoScaling}
                                onChange={(e) =>
                                    tfvarDispatch({
                                        type: "autoscaling",
                                        fieldName: "networkPolicy",
                                        payload: e.currentTarget.value,
                                    })
                                }
                            />
                        </div>
                        <Button variant="outline-success" size="sm" onClick={planHandler} disabled={inProgress}>
                            Plan
                        </Button>{" "}
                        <Button variant="outline-primary" size="sm" onClick={applyHandler} disabled={inProgress}>
                            Apply
                        </Button>{" "}
                        <Button variant="outline-danger" size="sm" onClick={destroyHandler} disabled={inProgress}>
                            Destroy
                        </Button>{" "}
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                                setLogs({ isStreaming: false, logs: btoa(JSON.stringify(tfvarConfig, null, 4)) })
                            }
                            disabled={inProgress}
                        >
                            Save Template
                        </Button>{" "}
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleCreateLab()}
                            disabled={inProgress}
                        >
                            Create Lab
                        </Button>{" "}
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setLogs({ isStreaming: false, logs: "" })}
                            disabled={inProgress}
                        >
                            Clear Logs
                        </Button>
                    </Form>
                </Col>
            </Row>
            <Row>
                {/* Following coloumn only contains modal so doesnt have any effect on the UI */}
                <Col>
                    <LabBuilder
                        showLabBuilder={showLabBuilder}
                        setShowLabBuilder={setShowLabBuilder}
                        tfvarConfig={tfvarConfig}
                    />
                </Col>
            </Row>
        </>
    );
}
