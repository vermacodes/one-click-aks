import { useEffect, useState } from "react";
import { useWebSocketContext } from "../Context/WebSocketContext";
import { toast } from "react-toastify";
import { useQueryClient } from "react-query";

export default function ServerNotification() {
  const { serverNotification, setServerNotification } = useWebSocketContext();
  const [toastShown, setToastShown] = useState(false);

  const queryClient = useQueryClient();
  const invalidateQueriesList = ["list-deployments"];

  useEffect(() => {
    if (!toastShown && serverNotification.message !== "") {
      toast(serverNotification.message, {
        type: serverNotification.type,
        autoClose:
          serverNotification.autoClose == 0
            ? false
            : serverNotification.autoClose,
      });
      setToastShown(true);
      queryClient.invalidateQueries(invalidateQueriesList);
    }
  }, [serverNotification, toastShown]);

  useEffect(() => {
    if (toastShown) {
      setServerNotification({ ...serverNotification, message: "" });
      setToastShown(false);
    }
  }, [toastShown, setServerNotification, serverNotification]);

  return null;
}
