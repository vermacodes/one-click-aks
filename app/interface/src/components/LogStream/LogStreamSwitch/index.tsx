import { useLogs, useSetLogs } from "../../../hooks/useLogs";
import Checkbox from "../../Checkbox";

export default function LogStreamSwitch() {
  const { data: logStream, isFetching, isLoading } = useLogs();
  const { mutate: setLogs } = useSetLogs();

  function handleLogStreamChange() {
    if (logStream === undefined) {
      return;
    }
    setLogs({ isStreaming: !logStream.isStreaming, logs: logStream.logs });
  }

  if (logStream === undefined) {
    return (
      <Checkbox
        checked={false}
        disabled={true}
        handleOnChange={handleLogStreamChange}
        id="log-stream-switch"
        label="Stream Logs"
        key={"log-stream-switch"}
      />
    );
  }

  return (
    <Checkbox
      checked={logStream.isStreaming}
      disabled={isFetching || isLoading}
      handleOnChange={handleLogStreamChange}
      id="log-stream-switch"
      label="Stream Logs"
      key={"log-stream-switch"}
    />
  );
}
