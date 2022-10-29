import cluster from "cluster"
import { useEffect, useState } from "react"
import { Col, Row, Button, Form } from "react-bootstrap"
import { actionHandler, actionHandlerPost } from "../api/streamLogs"
import { ClusterConfigurationType } from "../dataStructures"

type ConsoleProps = {
    setLogs(args: string): void
    prevLogsRef: React.MutableRefObject<string | null | undefined>
}

const defaultClusterConfig:ClusterConfigurationType = {
    networkPlugin: 'azure'
}

function Console(props: ConsoleProps) {

    const [actionInProgress, setActionInProgress] = useState<boolean>(false)
    const [clusterConfig, setClusterConfig] = useState<ClusterConfigurationType>(defaultClusterConfig)

    useEffect(() => {
      console.log(clusterConfig?.networkPlugin)
    }, [clusterConfig])
    
    //This function is called at the end of logs streaming of apply and destory.
    function streamEndActions() {
        setActionInProgress(false)
    }

    function applyHandler() {
        setActionInProgress(true) //This is set to 'false' in streamEndActions.
        props.setLogs("")
        actionHandlerPost('http://localhost:8080/apply', props.prevLogsRef, props.setLogs, streamEndActions, clusterConfig)
    }

    function destroyHandler() {
        setActionInProgress(true) //This is set to 'false' in streamEndActions.
        props.setLogs("")
        actionHandler('http://localhost:8080/destroy', props.prevLogsRef, props.setLogs, streamEndActions)
    }

    return (
        <>
            <Row style={{ textAlign: "left" }} className='mt-1'>
                <Col>
                    <Form>
                        <Form.Label className="pr-3">Networking:</Form.Label>
                        <div key='inline-radio' className="mb-3">
                            <Form.Check
                                inline
                                label="Azure CNI"
                                name="group1"
                                type='radio'
                                id='azure'
                                value='azure'
                                defaultChecked
                                onChange={e => setClusterConfig({networkPlugin: e.currentTarget.value})}
                            />
                            <Form.Check
                                inline
                                label="Kubenet"
                                name="group1"
                                type='radio'
                                id='kubenet'
                                value='kubenet'
                                onChange={e => setClusterConfig({networkPlugin: e.currentTarget.value})}
                            />
                            <Form.Check
                                inline
                                label="Calico"
                                name="group1"
                                type='radio'
                                id='calico'
                                disabled
                                value='calico'
                                onChange={e => setClusterConfig({networkPlugin: e.currentTarget.value})}
                            />
                        </div>
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