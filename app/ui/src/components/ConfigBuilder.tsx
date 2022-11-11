import { useEffect, useReducer } from "react"
import { Col, Row, Button, Form } from "react-bootstrap"
import { actionHandlerPost } from "../api/streamLogs"
import {  TfvarConfigType } from "../dataStructures"
import LabBuilder from "./LabBuilder"

type ConfigBuilderProps = {
    setLogs(args: string): void
    prevLogsRef: React.MutableRefObject<string | null | undefined>
    isActionInProgress: boolean
    setIsActionInProgress(args: boolean): void
    showLabBuilder: boolean
    setShowLabBuilder(args: boolean): void
}

interface ClusterConfigAction {
    type: string
    fieldName: string
    payload: string
}

const defaultTfvarConfig: TfvarConfigType = {
    resourceGroup: {
        location: "East US"
    },
    kubernetesCluster: {
        networkPlugin: 'azure',
        networkPolicy: 'azure',
        privateClusterEnabled: 'true'
    },
    virtualNetworks: [{
        addressSpace: ["10.1.0.0/16"]
    }],
    subnets: [{
        addressPrefixes: ["10.1.1.0/24"],
        name: "AzureFirewallSubnet"
    },
    {
        addressPrefixes: ["10.1.2.0/24"],
        name: "JumpServerSubnet"
    },
    {
        addressPrefixes: ["10.1.3.0/24"],
        name: "KubernetesSubnet"
    }],
    jumpservers: [{
        adminUsername: "aksadmin",
        adminPassword: "Password1234!"
    }]
}

function tfvarConfigReducer(state: TfvarConfigType, action: ClusterConfigAction): TfvarConfigType {
    switch (action.type) {
        case 'azureCNI': {

            let networkPolicy = state.kubernetesCluster.networkPolicy
            if (networkPolicy === 'null') {
                networkPolicy = 'azure'
            }

            return {
                ...state,
                kubernetesCluster: {
                    ...state.kubernetesCluster,
                    networkPlugin: 'azure',
                    networkPolicy: networkPolicy
                }
            }
        }
        case 'kubenet': {
            const newState = { ...state }
            const newKubernetesCluster = { ...newState.kubernetesCluster }
            newKubernetesCluster.networkPlugin = 'kubenet'
            newKubernetesCluster.networkPolicy = 'null'
            newState.kubernetesCluster = newKubernetesCluster
            return newState
        }
        case 'calico': {
            const newState = { ...state }
            const newKubernetesCluster = { ...newState.kubernetesCluster }
            if (newKubernetesCluster.networkPolicy === 'calico'){
                newKubernetesCluster.networkPolicy = 'azure'
            } else {
                newKubernetesCluster.networkPolicy = 'calico'
            }
            newState.kubernetesCluster = newKubernetesCluster
            return newState
        }
        case 'virtualNetworks': {
            if (state.virtualNetworks.length === 0) {
                return {
                    ...state,
                    virtualNetworks: defaultTfvarConfig.virtualNetworks,
                    subnets: defaultTfvarConfig.subnets
                }
            }
            return {
                ...state,
                virtualNetworks: [],
                subnets: [],
                jumpservers: []
            }
        }
        case 'jumpservers': {
            if (state.virtualNetworks.length > 0) {
                if (state.jumpservers.length === 0) {
                    return {
                        ...state,
                        jumpservers: defaultTfvarConfig.jumpservers
                    }
                }
                return {
                    ...state,
                    jumpservers: []
                }
            }
            return state
        }
        case 'privateClusterEnabled': {
            const newState = { ...state }
            const newKubernetesCluster = { ...newState.kubernetesCluster }
            if (state.kubernetesCluster.privateClusterEnabled === 'true') {
                newKubernetesCluster.privateClusterEnabled = 'false'
                newState.kubernetesCluster = newKubernetesCluster
                return {
                    ...newState,
                    jumpservers: []
                }
            }
            newKubernetesCluster.privateClusterEnabled = 'true'
            newState.kubernetesCluster = newKubernetesCluster
            return newState
        }
    }
    return state
}

export default function ConfigBuilder({setLogs, prevLogsRef, isActionInProgress, setIsActionInProgress, showLabBuilder, setShowLabBuilder}: ConfigBuilderProps) {
    const [tfvarConfig, tfvarDispatch] = useReducer(tfvarConfigReducer, defaultTfvarConfig)

    useEffect(() => {
        !isActionInProgress && setLogs(JSON.stringify(tfvarConfig, null, 4))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tfvarConfig])

    //This function is called at the end of logs streaming of apply and destory.
    function streamEndActions() {
        setIsActionInProgress(false)
    }

    function applyHandler() {
        setIsActionInProgress(true) //This is set to 'false' in streamEndActions.
        setLogs("")
        actionHandlerPost('http://localhost:8080/apply', prevLogsRef, setLogs, streamEndActions, tfvarConfig)
    }

    function planHandler() {
        setIsActionInProgress(true) //This is set to 'false' in streamEndActions.
        setLogs("")
        actionHandlerPost('http://localhost:8080/plan', prevLogsRef, setLogs, streamEndActions, tfvarConfig)
    }

    function destroyHandler() {
        setIsActionInProgress(true) //This is set to 'false' in streamEndActions.
        setLogs("")
        actionHandlerPost('http://localhost:8080/destroy', prevLogsRef, setLogs, streamEndActions, tfvarConfig)
    }

    function handleCreateLab() {
        setShowLabBuilder(true)
    }

    return (
        <>
            <Row style={{ textAlign: "left" }} className='mt-1'>
                <Col>
                    <Form>
                        <div key='inline-switch-networkPlugin' className="mb-3">
                            <Form.Check
                                inline
                                label='Custom Vnet'
                                type='switch'
                                id='virtualNetworks'
                                value='virtualNetworks'
                                checked={tfvarConfig.virtualNetworks.length > 0}
                                onChange={e => tfvarDispatch({ type: 'virtualNetworks', fieldName: 'virtualNetworks', payload: e.currentTarget.value })}
                            />
                            <Form.Check
                                inline
                                label='Private Cluster'
                                type='switch'
                                id='privateClusterEnabled'
                                value='privateClusterEnabled'
                                checked={tfvarConfig.kubernetesCluster.privateClusterEnabled === 'true'}
                                onChange={e => tfvarDispatch({ type: 'privateClusterEnabled', fieldName: 'privateClusterEnabled', payload: e.currentTarget.value })}
                            />
                            <Form.Check
                                inline
                                label='Jump Server'
                                type='switch'
                                id='jumpservers'
                                value='jumpservers'
                                disabled={tfvarConfig.virtualNetworks.length === 0 || tfvarConfig.kubernetesCluster.privateClusterEnabled === 'false'}
                                checked={tfvarConfig.jumpservers.length > 0}
                                onChange={e => tfvarDispatch({ type: 'jumpservers', fieldName: 'jumpservers', payload: e.currentTarget.value })}
                            />
                            <Form.Check
                                inline
                                label='Azure CNI'
                                type='switch'
                                id='azureCNI'
                                value='azure'
                                checked={'azure' === tfvarConfig.kubernetesCluster.networkPlugin}
                                onChange={e => tfvarDispatch({ type: 'azureCNI', fieldName: 'networkPlugin', payload: e.currentTarget.value })}
                            />
                            <Form.Check
                                inline
                                label='Kubenet'
                                type='switch'
                                id='kubenet'
                                value='kubenet'
                                checked={'kubenet' === tfvarConfig.kubernetesCluster.networkPlugin}
                                onChange={e => tfvarDispatch({ type: 'kubenet', fieldName: 'networkPlugin', payload: e.currentTarget.value })}
                            />
                            <Form.Check
                                inline
                                label='Calico'
                                name="group2"
                                type='switch'
                                id='calico'
                                value='calico'
                                checked={'calico' === tfvarConfig.kubernetesCluster.networkPolicy}
                                disabled={tfvarConfig.kubernetesCluster.networkPlugin === 'kubenet' || tfvarConfig.kubernetesCluster.networkPolicy === 'null'}
                                onChange={e => tfvarDispatch({ type: 'calico', fieldName: 'networkPolicy', payload: e.currentTarget.value })}
                            />
                        </div>
                        <Button variant="outline-success" size="sm" onClick={planHandler} disabled={isActionInProgress}>Plan</Button>{' '}
                        <Button variant="outline-primary" size="sm" onClick={applyHandler} disabled={isActionInProgress}>Apply</Button>{' '}
                        <Button variant="outline-danger" size="sm" onClick={destroyHandler} disabled={isActionInProgress}>Destroy</Button>{' '}
                        <Button variant="outline-primary" size="sm" onClick={() => setLogs(JSON.stringify(tfvarConfig, null, 4))} disabled={isActionInProgress}>Save Template</Button>{' '}
                        <Button variant="outline-primary" size="sm" onClick={() => handleCreateLab()} disabled={isActionInProgress}>Create Lab</Button>{' '}
                        <Button variant="outline-secondary" size="sm" onClick={() => setLogs("")} disabled={isActionInProgress}>Clear Logs</Button>
                    </Form>
                </Col>
                {/* Following coloumn only contains modal so doesnt have any effect on the UI */}
                <Col>
                    <LabBuilder showLabBuilder={showLabBuilder} setShowLabBuilder={setShowLabBuilder} tfvarConfig={tfvarConfig}/>
                </Col>
            </Row>
        </>
    )
}