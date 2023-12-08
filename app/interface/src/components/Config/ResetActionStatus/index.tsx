import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axios-interceptors";
import Button from "../../UserInterfaceComponents/Button";

type Props = {};

export default function ResetActionStatus({}: Props) {
  function onClickHandler() {
    const response = toast.promise(
      axiosInstance.put("actionstatus", { inProgress: false }),
      {
        pending: "Resetting action status...",
        success: {
          render(data: any) {
            return `Action status reset completed.`;
          },
          autoClose: 2000,
        },
        error: {
          render(data: any) {
            return `Action status reset failed: ${data.data.response.data.error}`;
          },
          autoClose: 5000,
        },
      }
    );
    response.then(() => {
      axiosInstance.put("logs/endstream");
    });
  }
  return (
    <div className="flex w-60 flex-col gap-2 p-2">
      <Button
        variant="danger-outline"
        onClick={onClickHandler}
        tooltipMessage="Reset the action status if you think server is gone crazy. This can breaks the safety net which prevents running duplicate actions on server. This also stops the log stream."
      >
        Stop Runaway Action
      </Button>
      <p className="text-xs">
        Reset the action status if you think server is gone crazy. This can
        breaks the safety net which prevents running duplicate actions on
        server. This also stops the log stream.
      </p>
    </div>
  );
}
