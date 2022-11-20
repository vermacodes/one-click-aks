import { Form } from "react-bootstrap";
import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import { defaultFirewall } from "./defaults";

export default function UserDefinedRouting() {
    const { data: tfvar, isLoading } = useTfvar();
    const { mutate: setTfvar } = useSetTfvar();
    const { data: inProgress } = useActionStatus();
    const { mutate: setLogs } = useSetLogs();

    function handleOnChange(tfvar: TfvarConfigType) {
        if (tfvar.firewalls.length > 0) {
            tfvar.kubernetesCluster.outboundType = "loadBalancer";
            tfvar.firewalls = [];
        } else {
            tfvar.kubernetesCluster.outboundType = "userDefinedRouting";
            tfvar.firewalls = [defaultFirewall];
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
                    label="UDR"
                    type="switch"
                    id="userDefinedRouting"
                    value="userDefinedRouting"
                    checked={tfvar.firewalls.length > 0}
                    disabled={tfvar.virtualNetworks.length === 0}
                    onChange={() => handleOnChange(tfvar)}
                />
            )}
        </>
    );
}
