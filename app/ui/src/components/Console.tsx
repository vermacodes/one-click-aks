import { useEffect, useReducer, useState } from "react"
import { Col, Row, Button, Form } from "react-bootstrap"
import { actionHandlerPost } from "../api/streamLogs"
import { TfvarKubernetesClusterType, TfvarConfigType, TfvarVirtualNetworkType, TfvarSubnetType } from "../dataStructures"

type ConsoleProps = {
    setLogs(args: string): void
    prevLogsRef: React.MutableRefObject<string | null | undefined>
}

const defaultVirtualNetworks: TfvarVirtualNetworkType = [
    {
        addressSpace: ["10.1.0.0/16"]
    }
]

const defaultSubnets: TfvarSubnetType = [
    {
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
    }
]

const defaultClusterConfig: TfvarKubernetesClusterType = {
    networkPlugin: 'azure',
    networkPolicy: 'azure',
}

interface ClusterConfigAction {
    type: string
    fieldName: string
    payload: string
}

function clusterConfigReducer(state: TfvarKubernetesClusterType, action: ClusterConfigAction) {
    switch (action.type) {
        case 'update': {
            const newState = { ...state }
            if (action.fieldName === 'networkPlugin' && action.payload === 'kubenet') {
                newState.networkPlugin = action.payload
                newState.networkPolicy = 'null'
                return newState
            }
            if (action.fieldName === 'networkPlugin' && action.payload === 'azure' && state.networkPolicy === 'null') {
                newState.networkPlugin = action.payload
                newState.networkPolicy = 'azure'
                return newState
            }
            return {
                ...state,
                [action.fieldName]: action.payload
            }
        }
    }
    return state
}

function buildTfConfig(clusterConfig: TfvarKubernetesClusterType): TfvarConfigType {
    return {
        resourceGroup: {
            location: "East US"
        },
        kubernetesCluster: clusterConfig,
        virtualNetworks: defaultVirtualNetworks,
        subnets: defaultSubnets
    }
}

function Console(props: ConsoleProps) {

    const [actionInProgress, setActionInProgress] = useState<boolean>(false)
    const [clusterConfig, dispatch] = useReducer(clusterConfigReducer, defaultClusterConfig)

    useEffect(() => {
        console.log("State changed : ", clusterConfig)
    }, [clusterConfig])

    //This function is called at the end of logs streaming of apply and destory.
    function streamEndActions() {
        setActionInProgress(false)
    }

    function applyHandler() {
        setActionInProgress(true) //This is set to 'false' in streamEndActions.
        props.setLogs("")
        actionHandlerPost('http://localhost:8080/apply', props.prevLogsRef, props.setLogs, streamEndActions, buildTfConfig(clusterConfig))
    }

    function planHandler() {
        setActionInProgress(true) //This is set to 'false' in streamEndActions.
        props.setLogs("")
        actionHandlerPost('http://localhost:8080/plan', props.prevLogsRef, props.setLogs, streamEndActions, buildTfConfig(clusterConfig))
    }

    function destroyHandler() {
        setActionInProgress(true) //This is set to 'false' in streamEndActions.
        props.setLogs("")
        actionHandlerPost('http://localhost:8080/destroy', props.prevLogsRef, props.setLogs, streamEndActions, buildTfConfig(clusterConfig))
    }

    return (
        <>
            <Row style={{ textAlign: "left" }} className='mt-1'>
                <Col>
                    <Form>
                        <Form.Label className="pr-3">Network Plugin:</Form.Label>
                        <div key='inline-switch-networkPlugin' className="mb-3">
                            {['azure', 'kubenet'].map(plugin => (
                                <Form.Check
                                    inline
                                    label={plugin}
                                    name="group1"
                                    type='switch'
                                    id={plugin}
                                    value={plugin}
                                    checked={plugin === clusterConfig.networkPlugin}
                                    onChange={e => dispatch({ type: 'update', fieldName: 'networkPlugin', payload: e.currentTarget.value })}
                                />
                            ))}
                        </div>
                        <Form.Label className="pr-3">Network Policy:</Form.Label>
                        <div key='inline-switch-networkPolicy' className="mb-3">
                            {['azure', 'calico'].map(policy => (
                                <Form.Check
                                    inline
                                    label={policy}
                                    name="group2"
                                    type='switch'
                                    id={policy}
                                    value={policy}
                                    checked={policy === clusterConfig.networkPolicy}
                                    disabled={clusterConfig.networkPlugin === 'kubenet' || clusterConfig.networkPolicy === 'null'}
                                    onChange={e => dispatch({ type: 'update', fieldName: 'networkPolicy', payload: e.currentTarget.value })}
                                />
                            ))}
                            <Form.Check
                                inline
                                label='null'
                                name="group2"
                                type='switch'
                                id='null'
                                value='null'
                                checked={'null' === clusterConfig.networkPolicy}
                                disabled
                                onChange={e => dispatch({ type: 'update', fieldName: 'networkPolicy', payload: e.currentTarget.value })}
                            />
                        </div>
                        <Button variant="outline-success" onClick={planHandler} disabled={actionInProgress}>Plan</Button>{' '}
                        <Button variant="outline-primary" onClick={applyHandler} disabled={actionInProgress}>Apply</Button>{' '}
                        <Button variant="outline-danger" onClick={destroyHandler} disabled={actionInProgress}>Destroy</Button>{' '}
                        <Button variant="outline-secondary" onClick={() => props.setLogs("")} disabled={actionInProgress}>Clear Logs</Button>
                    </Form>
                </Col>
            </Row>
        </>
    )
}

export default Console