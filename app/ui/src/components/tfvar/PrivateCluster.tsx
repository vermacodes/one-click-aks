import { Form } from "react-bootstrap";
import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";

export default function PrivateCluster() {
    const { data: tfvar, isLoading } = useTfvar();
    const { mutate: setTfvar } = useSetTfvar();
    const { data: inProgress } = useActionStatus();
    const { mutate: setLogs } = useSetLogs();

    function handleOnChange(tfvar: TfvarConfigType) {
        if (tfvar.kubernetesCluster.privateClusterEnabled === "true") {
            tfvar.kubernetesCluster.privateClusterEnabled = "false";
            tfvar.jumpservers = [];
        } else {
            tfvar.kubernetesCluster.privateClusterEnabled = "true";
        }
        !inProgress && setLogs({ isStreaming: false, logs: JSON.stringify(tfvar, null, 4) });
        setTfvar(tfvar);
    }

    if (tfvar === undefined || isLoading) {
        return <>Loading...</>;
    }

    return (
        <Form.Check
            inline
            label="Private Cluster"
            type="switch"
            id="privateClusterEnabled"
            value="privateClusterEnabled"
            checked={tfvar.kubernetesCluster.privateClusterEnabled === "true"}
            disabled={tfvar.virtualNetworks.length === 0}
            onChange={() => handleOnChange(tfvar)}
        />
    );
}
