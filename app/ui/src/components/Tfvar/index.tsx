import { useState } from "react";
import { useActionStatus, useSetActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useTfvar } from "../../hooks/useTfvar";
import { axiosInstance } from "../../utils/axios-interceptors";
import {
    Button,
    dangerButtonClassName,
    primaryButtonClassName,
    secondaryButtonClassName,
    successButtonClassName,
} from "../Button";
import AutoScaling from "./AutoScaling";
import AzureCNI from "./AzureCNI";
import Calico from "./Calico";
import CustomVnet from "./CustomVnet";
import JumpServer from "./JumpServer";
import PrivateCluster from "./PrivateCluster";
import UserDefinedRouting from "./UserDefinedRouting";

export default function Tfvar() {
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
            <div className="flex space-x-2">
                <CustomVnet />
                <PrivateCluster />
                <JumpServer />
                <AzureCNI />
                <Calico />
                <AutoScaling />
                <UserDefinedRouting />
            </div>
            <div className="flex mt-4 space-x-2">
                <button className={successButtonClassName} onClick={planHandler} disabled={inProgress}>
                    Plan
                </button>
                <button className={primaryButtonClassName} onClick={applyHandler} disabled={inProgress}>
                    Apply
                </button>
                <button className={dangerButtonClassName} onClick={destroyHandler} disabled={inProgress}>
                    Destroy
                </button>
                <button className={secondaryButtonClassName} onClick={destroyHandler} disabled={true}>
                    Create Lab
                </button>
                <button
                    className={secondaryButtonClassName}
                    onClick={() => setLogs({ isStreaming: false, logs: "" })}
                    disabled={inProgress}
                >
                    Clear Logs
                </button>
            </div>
        </>
    );
}
