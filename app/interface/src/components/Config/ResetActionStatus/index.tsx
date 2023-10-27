import { axiosInstance } from "../../../utils/axios-interceptors";
import Button from "../../UserInterfaceComponents/Button";

type Props = {};

export default function ResetActionStatus({}: Props) {
  return (
    <div className="flex w-60 flex-col gap-2 p-2">
      <Button
        variant="danger-outline"
        onClick={() =>
          axiosInstance
            .put("actionstatus", {
              inProgress: false,
            })
            .then(() => axiosInstance.put("logs/endstream"))
        }
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
