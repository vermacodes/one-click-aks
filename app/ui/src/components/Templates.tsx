import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { BlobType } from "../dataStructures";
import { useActionStatus, useSetActionStatus } from "../hooks/useActionStatus";

type TemplateProps = {
    setLogs(args: string): void;
    prevLogsRef: React.MutableRefObject<string | null | undefined>;
};

export default function Templates({ setLogs, prevLogsRef }: TemplateProps) {
    const [blobs, setBlobs] = useState<BlobType[] | undefined>();
    const { data: inProgress } = useActionStatus();
    const { mutate: setActionStatus } = useSetActionStatus();

    useEffect(() => {
        getBlobs();
        if (!inProgress) {
            setLogs("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getBlobs() {
        axios
            .get("http://localhost:8080/sharedtemplates")
            .then((response) => {
                // Ok. if you noted that the its named blob and should be Blobs. I've no idea whose fault is this.
                // Read more about the API https://learn.microsoft.com/en-us/rest/api/storageservices/list-blobs?tabs=azure-ad#request
                setBlobs(response.data.blob);
            })
            .catch((error) => {
                console.log("Error : ", error);
            });
    }

    //This function is called at the end of logs streaming of apply and destory.
    function streamEndActions() {}

    function actionHandler(url: string, action: string) {
        axios.get(url).then((response) => {
            setActionStatus({ inProgress: true });
            setLogs("");
            axios(`http://localhost:8080/${action}`, response.data);
        });
    }

    function viewHandler(url: string) {
        axios.get(url).then((response) => {
            console.log(response.data);
            setLogs(JSON.stringify(response.data, null, 4));
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
                        {blobs.map((blob) => (
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
