import Button from "../../../UserInterfaceComponents/Button";
import { useInit } from "../../../../hooks/useTerraform";
import { useLab } from "../../../../hooks/useLab";
import { useContext } from "react";
import { WebSocketContext } from "../../../../WebSocketContext";
import { useSetLogs } from "../../../../hooks/useLogs";
import { ButtonVariant, Lab } from "../../../../dataStructures";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
};

export default function InitButton({ variant, children }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: initAsync } = useInit();
  const { data: lab } = useLab();

  function initHandler() {
    setLogs({ logs: "" });
    lab && initAsync(lab);
  }

  return (
    <Button
      variant={variant}
      onClick={initHandler}
      disabled={actionStatus.inProgress}
    >
      {children}
    </Button>
  );
}
