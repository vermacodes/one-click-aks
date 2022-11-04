import axios from "axios"
import { useEffect, useState } from "react"
import { Button, Table } from "react-bootstrap"
import { actionHandlerPost } from "../api/streamLogs"
import { BlobType } from "../dataStructures"

type TemplateProps = {
    setLogs(args: string): void
    prevLogsRef: React.MutableRefObject<string | null | undefined>
}

export default function Templates(props: TemplateProps) {
    const [blobs, setBlobs] = useState<BlobType[] | undefined>()
    const [actionInProgress, setActionInProgress] = useState<boolean>(false)

    useEffect(() => {
        getBlobs()
    }, [])

    function getBlobs() {
        axios.get("http://localhost:8080/sharedtemplates").then(response => {
            
            // Ok. if you noted that the its named blob and should be Blobs. I've no idea whose fault is this.
            // Read more about the API https://learn.microsoft.com/en-us/rest/api/storageservices/list-blobs?tabs=azure-ad#request
            setBlobs(response.data.blob)
        }).catch(error => {
            console.log("Error : ", error)
        })
    }

    //This function is called at the end of logs streaming of apply and destory.
    function streamEndActions() {
        setActionInProgress(false)
    }

    function actionHandler(url: string, action: string) {
        axios.get(url).then(response => {   
            setActionInProgress(true) //This is set to 'false' in streamEndActions.
            props.setLogs("")
            actionHandlerPost(`http://localhost:8080/${action}`, props.prevLogsRef, props.setLogs, streamEndActions, response.data)
        })
    }

    function viewHandler(url: string) {
        axios.get(url).then(response => {
            console.log(response.data)
            props.setLogs(JSON.stringify(response.data, null, 4))
        })
    }

    return (
        <>
            {blobs !== undefined &&
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th>Template Name</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {blobs.map(blob => (
                        <tr key={blob.name}>
                            <td>{blob.name}</td>
                            <td>
                                <Button size="sm" variant="outline-secondary" onClick={() => viewHandler(blob.url)}>View</Button>{' '}
                                <Button size="sm" variant="outline-success" onClick={() => actionHandler(blob.url, 'plan')}>Plan</Button>{' '}
                                <Button size="sm" variant="outline-primary" onClick={() => actionHandler(blob.url, 'apply')}>Apply</Button>{' '}
                                <Button size="sm" variant="outline-danger" onClick={() => actionHandler(blob.url, 'destroy')}>Destroy</Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            }
        </>
    )
}