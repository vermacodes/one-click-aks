import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { BlobType } from "../dataStructures";
import { useActionStatus, useSetActionStatus } from "../hooks/useActionStatus";
import { useSharedTemplates } from "../hooks/useBlobs";
import { useSetLogs } from "../hooks/useLogs";

export default function Templates() {
    const { data: inProgress } = useActionStatus();
    const { mutate: setActionStatus } = useSetActionStatus();
    const { mutate: setLogs } = useSetLogs();
    const { data: blobs } = useSharedTemplates();

    function actionHandler(url: string, action: string) {
        axios.get(url).then((response) => {
            setActionStatus({ inProgress: true });
            setLogs({ isStreaming: true, logs: "" });
            axios(`http://localhost:8080/${action}`, response.data);
        });
    }

    function viewHandler(url: string) {
        axios.get(url).then((response) => {
            console.log(response.data);
            setLogs({ isStreaming: false, logs: JSON.stringify(response.data, null, 4) });
        });
    }

    return (
        <>
            {blobs !== undefined && (
                <Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>Template Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blobs.map((blob: any) => (
                            <tr key={blob.name}>
                                <td>{blob.name}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => viewHandler(blob.url)}
                                        disabled={inProgress}
                                    >
                                        View
                                    </Button>{" "}
                                    <Button
                                        size="sm"
                                        variant="outline-success"
                                        onClick={() => actionHandler(blob.url, "plan")}
                                        disabled={inProgress}
                                    >
                                        Plan
                                    </Button>{" "}
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => actionHandler(blob.url, "apply")}
                                        disabled={inProgress}
                                    >
                                        Apply
                                    </Button>{" "}
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => actionHandler(blob.url, "destroy")}
                                        disabled={inProgress}
                                    >
                                        Destroy
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </>
    );
}
