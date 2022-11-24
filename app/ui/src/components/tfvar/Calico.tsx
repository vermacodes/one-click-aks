import { Form } from "react-bootstrap";
import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";

export default function Calico() {
    const { data: tfvar, isLoading } = useTfvar();
    const { mutate: setTfvar } = useSetTfvar();
    const { data: inProgress } = useActionStatus();
    const { mutate: setLogs } = useSetLogs();

    function handleOnChange(tfvar: TfvarConfigType) {
        if ("calico" === tfvar.kubernetesCluster.networkPolicy) {
            tfvar.kubernetesCluster.networkPolicy = "azure";
        } else {
            tfvar.kubernetesCluster.networkPolicy = "calico";
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
                    label="Calico"
                    type="switch"
                    id="calico"
                    value="calico"
                    checked={"calico" === tfvar.kubernetesCluster.networkPolicy}
                    disabled={tfvar.kubernetesCluster.networkPlugin === "kubenet"}
                    onChange={() => handleOnChange(tfvar)}
                />
            )}
        </>
    );
}
