import axios from "axios"
import { useEffect, useState } from "react"
import { Button, Table } from "react-bootstrap"
import { BlobType } from "../dataStructures"


export default function Templates() {
    const [blobs, setBlobs] = useState<BlobType[] | undefined>()

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

    return (
        <>
            {blobs !== undefined &&
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Template Name</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    {blobs.map(blob => (
                        <tbody>
                        <tr>
                            <td>{blob.name}</td>
                            <td>
                                <Button size="sm" variant="outline-primary">View</Button>{' '}
                                <Button size="sm" variant="outline-success">Apply</Button>
                            </td>
                        </tr>
                        </tbody>
                    ))}
                </Table>
            }
        </>
    )
}