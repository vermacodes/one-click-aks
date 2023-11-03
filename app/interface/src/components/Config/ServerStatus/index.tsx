import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useServerStatus } from "../../../hooks/useServerStatus";
import SettingsItemLayout from "../../../layouts/SettingsItemLayout";

export default function ServerStatus() {
  const { data: serverStatus } = useServerStatus();
  return (
    <SettingsItemLayout>
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Server Status</h2>
        <div className="flex gap-x-2 divide-x-2">
          {serverStatus && serverStatus.status === "OK" ? (
            <div className="flex items-center gap-x-2">
              <span className="text-green-500">
                <FaCheckCircle />{" "}
              </span>
              Running
            </div>
          ) : (
            <div className="flex items-center gap-x-2">
              <span className="text-rose-500">
                <FaExclamationCircle />{" "}
              </span>
              Not Running
            </div>
          )}
          {serverStatus && (
            <p className="pl-2">Version: {serverStatus.version}</p>
          )}
        </div>
      </div>
    </SettingsItemLayout>
  );
}
