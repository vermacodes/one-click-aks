import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useActionStatus, useSetActionStatus } from "../hooks/useActionStatus";
import { useSetLogs } from "../hooks/useLogs";
import { useTfvar } from "../hooks/useTfvar";
import { axiosInstance } from "../utils/axios-interceptors";
import LabBuilder from "./LabBuilder";
import AutoScaling from "./tfvar/AutoScaling";
import AzureCNI from "./tfvar/AzureCNI";
import Calico from "./tfvar/Calico";
import CustomVnet from "./tfvar/CustomVnet";
import JumpServer from "./tfvar/JumpServer";
import PrivateCluster from "./tfvar/PrivateCluster";
import UserDefinedRouting from "./tfvar/UserDefinedRouting";

export default function ConfigBuilder() {
    const [showLabBuilder, setShowLabBuilder] = useState(false);

    const { data: inProgress } = useActionStatus();
    const { mutate: setActionStatus } = useSetActionStatus();
    const { mutate: setLogs } = useSetLogs();
    const { data: tfvar } = useTfvar();

    function applyHandler() {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        axiosInstance.post("apply", tfvar);
    }

    function planHandler() {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        axiosInstance.post("plan", tfvar);
    }

    function destroyHandler() {
        setActionStatus({ inProgress: true });
        setLogs({ isStreaming: true, logs: "" });
        axiosInstance.post("destroy", tfvar);
    }

    function handleCreateLab() {
        setShowLabBuilder(true);
    }

    return (
        <>
            <Row style={{ textAlign: "left" }} className="mt-1">
                <Col>
                    <Form>
                        <div key="inline-switch-networkPlugin" className="mb-3">
                            <CustomVnet />
                            <PrivateCluster />
                            <JumpServer />
                            <AzureCNI />
                            <Calico />
                            <AutoScaling />
                            <UserDefinedRouting />
                        </div>
                        <Button variant="outline-success" size="sm" onClick={planHandler} disabled={inProgress}>
                            Plan
                        </Button>{" "}
                        <Button variant="outline-primary" size="sm" onClick={applyHandler} disabled={inProgress}>
                            Apply
                        </Button>{" "}
                        <Button variant="outline-danger" size="sm" onClick={destroyHandler} disabled={inProgress}>
                            Destroy
                        </Button>{" "}
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setLogs({ isStreaming: false, logs: btoa(JSON.stringify(tfvar, null, 4)) })}
                            disabled={inProgress}
                        >
                            Save Template
                        </Button>{" "}
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleCreateLab()}
                            disabled={inProgress}
                        >
                            Create Lab
                        </Button>{" "}
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setLogs({ isStreaming: false, logs: "" })}
                            disabled={inProgress}
                        >
                            Clear Logs
                        </Button>
                    </Form>
                </Col>
            </Row>
            <Row>
                {/* Following coloumn only contains modal so doesnt have any effect on the UI */}
                <Col>
                    <LabBuilder
                        showLabBuilder={showLabBuilder}
                        setShowLabBuilder={setShowLabBuilder}
                        tfvarConfig={tfvar}
                    />
                </Col>
            </Row>
        </>
    );
}
