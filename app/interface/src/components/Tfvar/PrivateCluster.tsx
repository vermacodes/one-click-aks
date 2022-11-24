import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";

export default function PrivateCluster() {
    const { data: tfvar, isLoading, isError } = useTfvar();
    const { mutate: setTfvar } = useSetTfvar();
    const { data: inProgress } = useActionStatus();
    const { mutate: setLogs } = useSetLogs();

    function handleOnChange() {
        if (tfvar.kubernetesCluster.privateClusterEnabled === "true") {
            tfvar.kubernetesCluster.privateClusterEnabled = "false";
            tfvar.jumpservers = [];
        } else {
            tfvar.kubernetesCluster.privateClusterEnabled = "true";
        }
        !inProgress && setLogs({ isStreaming: false, logs: JSON.stringify(tfvar, null, 4) });
        setTfvar(tfvar);
    }

    if (tfvar === undefined) {
        return <></>;
    }

    if (isLoading) {
        return <>Loading...</>;
    }

    return (
        <Checkbox
            id="toogle-privatecluster"
            label="Private Cluster"
            checked={tfvar.kubernetesCluster.privateClusterEnabled === "true"}
            disabled={tfvar.virtualNetworks.length === 0}
            handleOnChange={handleOnChange}
        />
    );
}
