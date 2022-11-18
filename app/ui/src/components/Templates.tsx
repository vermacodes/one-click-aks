import axios from "axios";
import { Button, Table } from "react-bootstrap";
import { useActionStatus, useSetActionStatus } from "../hooks/useActionStatus";
import { useSharedTemplates } from "../hooks/useBlobs";
import { useSetLogs } from "../hooks/useLogs";
import { axiosInstance } from "../utils/axios-interceptors";

export default function Templates() {
    const { data: inProgress } = useActionStatus();
    const { mutate: setActionStatus } = useSetActionStatus();
    const { mutate: setLogs } = useSetLogs();
    const { data: blobs, isLoading } = useSharedTemplates();

    function actionHandler(url: string, action: string) {
        axios.get(url).then((response) => {
            setActionStatus({ inProgress: true });
            setLogs({ isStreaming: true, logs: "" });
            axiosInstance.post(`${action}`, response.data);
        });
    }

    function viewHandler(url: string) {
        axios.get(url).then((response) => {
            console.log(response.data);
            setLogs({ isStreaming: false, logs: JSON.stringify(response.data, null, 4) });
        });
    }

    if (isLoading) {
        return <h4>Loading...</h4>;
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
