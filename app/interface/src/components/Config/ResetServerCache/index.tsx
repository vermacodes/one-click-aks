import { useContext } from "react";
import { WebSocketContext } from "../../../WebSocketContext";
import { useResetServerCache } from "../../../hooks/useServerCache";
import Button from "../../UserInterfaceComponents/Button";

type Props = {};

export default function ResetServerCache({}: Props) {
  const { mutateAsync: resetServerCacheAsync } = useResetServerCache();
  const { actionStatus } = useContext(WebSocketContext);
  return (
    <div className="flex w-60 flex-col gap-2 p-2">
      <Button
        variant="danger-outline"
        disabled={actionStatus.inProgress}
        onClick={() =>
          resetServerCacheAsync().finally(() => {
            window.location.reload();
          })
        }
      >
        Reset Server Cache
      </Button>
      <p className="text-xs">
        This can help recover from many silly bugs due to bad data in server
        cache. Make sure to save your lab before you reset cache. It reloads
        app.
      </p>
    </div>
  );
}
