import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { actionHandlerPost } from "../api/streamLogs";
import { BlobType } from "../dataStructures";
import { useActionStatus, useSetActionStatus } from "../hooks/useActionStatus";
import { useSetLogs } from "../hooks/useLogs";

type LearningProps = {
    setLogs(args: string): void;
    prevLogsRef: React.MutableRefObject<string | null | undefined>;
};

export default function Learning({ prevLogsRef }: LearningProps) {
    const [blobs, setBlobs] = useState<BlobType[]>();
    const [deployedBlob, setDeployedBlob] = useState<BlobType>({
        name: "",
        url: "",
    });

    const { data: inProgress } = useActionStatus();
    const { mutate: setActionStatus } = useSetActionStatus();
    const { mutate: setLogs } = useSetLogs();

    useEffect(() => {
        // if (!inProgress) {
        //     setLogs({ isStreaming: true, logs: "" });
        // }
        getBlobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //This function is called at the end of logs streaming of apply and destory.
    function streamEndActions() {}

    function getBlobs() {
        axios
            .get("http://localhost:8080/listlabs")
            .then((response) => {
                console.log(response.data.blob);
                setBlobs(response.data.blob);
            })
            .catch((error) => {
                console.log("Error : ", error);
            });
    }

    function deployHandler(blob: BlobType) {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        setDeployedBlob(blob);
        actionHandlerPost("http://localhost:8080/deploylab", prevLogsRef, setLogs, streamEndActions, blob);
    }

    //This function is called after deployHandler streaming ends.
    function breakHandler(blob: BlobType) {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        actionHandlerPost("http://localhost:8080/breaklab", prevLogsRef, setLogs, streamEndActions, blob);
    }

    function validateHandler(blob: BlobType) {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        actionHandlerPost("http://localhost:8080/validatelab", prevLogsRef, setLogs, streamEndActions, blob);
    }

    function destroyHandler(blob: BlobType) {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        actionHandlerPost("http://localhost:8080/destroy", prevLogsRef, setLogs, streamEndActions, blob);
    }

    return (
        <>
            {blobs && (
                <Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>Lab Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blobs.map((blob) => (
                            <tr key={blob.name}>
                                <td>{blob.name}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => deployHandler(blob)}
                                        disabled={inProgress}
                                    >
                                        Deploy
                                    </Button>{" "}
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => breakHandler(blob)}
                                        disabled={inProgress}
                                    >
                                        Break
                                    </Button>{" "}
                                    <Button
                                        size="sm"
                                        variant="outline-success"
                                        onClick={() => validateHandler(blob)}
                                        disabled={inProgress}
                                    >
                                        Validate
                                    </Button>{" "}
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => destroyHandler(blob)}
                                        disabled
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
