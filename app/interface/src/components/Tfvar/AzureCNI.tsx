import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar, useTfvar } from "../../hooks/useTfvar";
import Checkbox from "../Checkbox";

export default function AzureCNI() {
    const { data: tfvar, isLoading } = useTfvar();
    const { mutate: setTfvar } = useSetTfvar();
    const { data: inProgress } = useActionStatus();
    const { mutate: setLogs } = useSetLogs();

    function handleOnChange() {
        if ("azure" === tfvar.kubernetesCluster.networkPlugin) {
            tfvar.kubernetesCluster.networkPlugin = "kubenet";
            tfvar.kubernetesCluster.networkPolicy = "null";
        } else {
            tfvar.kubernetesCluster.networkPlugin = "azure";
            tfvar.kubernetesCluster.networkPolicy = "azure";
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
        <>
            {tfvar && (
                <Checkbox
                    id="toggle-azurecni"
                    label="Azure CNI"
                    checked={"azure" === tfvar.kubernetesCluster.networkPlugin}
                    disabled={false}
                    handleOnChange={handleOnChange}
                />
            )}
        </>
    );
}
