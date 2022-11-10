import { useEffect } from "react"
import { Button, Table } from "react-bootstrap"
import { actionHandlerPost } from "../api/streamLogs"
import { TfvarConfigType } from "../dataStructures"

type LearningProps = {
    setLogs(args: string): void
    prevLogsRef: React.MutableRefObject<string | null | undefined>
    isActionInProgress: boolean
    setIsActionInProgress(args: boolean): void
}

const defaultTfvarConfig: TfvarConfigType = {
    resourceGroup: {
        location: "East US"
    },
    kubernetesCluster: {
        networkPlugin: 'azure',
        networkPolicy: 'azure',
        privateClusterEnabled: 'false'
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
    jumpservers: []
}

export default function Learning({setLogs, prevLogsRef, isActionInProgress, setIsActionInProgress}: LearningProps) {

    useEffect(() => {
        if (!isActionInProgress) {
            setLogs(JSON.stringify(defaultTfvarConfig, null, 4))
            setLogs("")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //This function is called at the end of logs streaming of apply and destory.
    function streamEndActions() {
        setIsActionInProgress(false)
    }

    function deployHandler() {
        setIsActionInProgress(true) //This is set to 'false' in streamEndActions.
        setLogs("")
        actionHandlerPost('http://localhost:8080/lab', prevLogsRef, setLogs, streamEndActions, defaultTfvarConfig)
    }

    function validateHandler() {
        setIsActionInProgress(true) //This is set to 'false' in streamEndActions.
        setLogs("")
        actionHandlerPost('http://localhost:8080/validatelab', prevLogsRef, setLogs, streamEndActions, defaultTfvarConfig)
    }

    function destroyHandler() {
        setIsActionInProgress(true) //This is set to 'false' in streamEndActions.
        setLogs("")
        actionHandlerPost('http://localhost:8080/destroy', prevLogsRef, setLogs, streamEndActions, defaultTfvarConfig)
    }
    
    return(
        <Table striped bordered hover size="sm">
            <thead>
                <tr>
                    <th>
                        Lab Name
                    </th>
                    <th>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        Demo Lab
                    </td>
                    <td>
                        <Button size="sm" variant="outline-primary" onClick={() => deployHandler()} disabled={isActionInProgress}>Deploy</Button>{' '}
                        <Button size="sm" variant="outline-success" onClick={() => validateHandler()} disabled={isActionInProgress}>Validate</Button>{' '}
                        <Button size="sm" variant="outline-danger" onClick={() => destroyHandler()} disabled={isActionInProgress}>Destroy</Button>
                    </td>
                </tr>
            </tbody>
        </Table>
    )
}