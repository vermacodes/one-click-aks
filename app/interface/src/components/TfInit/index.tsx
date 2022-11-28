import Button from "../Button";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useSetLogs } from "../../hooks/useLogs";
import { axiosInstance } from "../../utils/axios-interceptors";

type Props = {};

export default function TfInit({}: Props) {
  const { data: inProgress } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { mutate: setLogs } = useSetLogs();

  function initHandler() {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.get("tfinit");
  }

  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <h2 className="text-lg">Initialize Terraform</h2>
        <Button variant="primary" onClick={initHandler} disabled={inProgress}>
          Terraform Init
        </Button>
      </div>
      <div className="flex flex-col">
        <p className="text-xs text-slate-700 dark:text-slate-300">
          - Terraform is auto initialized after login. But if you see issues,
          use this to initialize again.
        </p>
        <p className="text-xs text-slate-700 dark:text-slate-300"></p>
      </div>
    </div>
  );
}
