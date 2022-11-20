import { Form } from "react-bootstrap";
import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import { defaultTfvarConfig } from "./defaults";

export default function JumpServer() {
    const { data: tfvar, isLoading } = useTfvar();
    const { mutate: setTfvar } = useSetTfvar();
    const { data: inProgress } = useActionStatus();
    const { mutate: setLogs } = useSetLogs();

    function hanldeOnChange(tfvar: TfvarConfigType) {
        if (tfvar.jumpservers.length === 0) {
            tfvar.jumpservers = defaultTfvarConfig.jumpservers;
        } else {
            tfvar.jumpservers = [];
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
                    label="Jump Server"
                    type="switch"
                    id="jumpservers"
                    value="jumpservers"
                    checked={tfvar.jumpservers.length > 0}
                    onChange={() => hanldeOnChange(tfvar)}
                />
            )}
        </>
    );
}
