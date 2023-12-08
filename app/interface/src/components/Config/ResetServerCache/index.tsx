import { useContext } from "react";
import { toast } from "react-toastify";
import { useResetServerCache } from "../../../hooks/useServerCache";
import { WebSocketContext } from "../../Context/WebSocketContext";
import Button from "../../UserInterfaceComponents/Button";

type Props = {};

export default function ResetServerCache({}: Props) {
  const { mutateAsync: resetServerCacheAsync } = useResetServerCache();
  const { actionStatus } = useContext(WebSocketContext);

  function handleResetServerCache() {
    const response = toast.promise(resetServerCacheAsync(), {
      pending: "Resetting Server Cache...",
      success: "Server Cache Reset.",
      error: {
        render(data: any) {
          return `Failed to reset server cache. ${data.data.response.data.error}`;
        },
      },
    });

    response.finally(() => {
      window.location.reload();
    });
  }
  return (
    <div className="flex w-60 flex-col gap-2 p-2">
      <Button
        variant="danger-outline"
        disabled={actionStatus.inProgress}
        onClick={handleResetServerCache}
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
