import { Form } from "react-bootstrap";
import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";

export default function AutoScaling() {
    const { data: tfvar, isLoading } = useTfvar();
    const { mutate: setTfvar } = useSetTfvar();
    const { data: inProgress } = useActionStatus();
    const { mutate: setLogs } = useSetLogs();

    function handleOnChange(tfvar: TfvarConfigType) {
        if (tfvar.kubernetesCluster.defaultNodePool.enableAutoScaling) {
            tfvar.kubernetesCluster.defaultNodePool.enableAutoScaling = false;
        } else {
            tfvar.kubernetesCluster.defaultNodePool.enableAutoScaling = true;
        }
        !inProgress && setLogs({ isStreaming: false, logs: JSON.stringify(tfvar, null, 4) });
        setTfvar(tfvar);
    }

    if (tfvar === undefined || isLoading) {
        return <>Loading...</>;
    }

    return (
        <>
            {tfvar && (
                <Form.Check
                    inline
                    label="Auto Scaling"
                    type="switch"
                    id="autoscaling"
                    value="autoscaling"
                    checked={tfvar.kubernetesCluster.defaultNodePool.enableAutoScaling}
                    onChange={() => handleOnChange(tfvar)}
                />
            )}
        </>
    );
}
