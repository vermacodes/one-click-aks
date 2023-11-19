import Button from "../../../UserInterfaceComponents/Button";
import { useInit } from "../../../../hooks/useTerraform";
import { useLab } from "../../../../hooks/useLab";
import { useContext, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  WebSocketContext,
  useWebSocketContext,
} from "../../../Context/WebSocketContext";
import { useSetLogs } from "../../../../hooks/useLogs";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import { toast } from "react-toastify";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
};

export default function InitButton({ variant, children }: Props) {
  const { actionStatus, terraformOperation } = useWebSocketContext();
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: initAsync } = useInit();
  const { data: lab } = useLab();
  const { onClickHandler } = useTerraformOperation();

  const [operationId, setOperationId] = useState<string>(uuid());

  useEffect(() => {
    if (terraformOperation.operationId === operationId) {
      if (terraformOperation.status === "Init Failed") {
        toast.error(terraformOperation.status);
        setOperationId(uuid());
      }
      if (terraformOperation.status === "Init Completed") {
        toast.success(terraformOperation.status);
        setOperationId(uuid());
      }
      if (terraformOperation.status === "Init In Progress") {
        toast.info(terraformOperation.status);
      }
    }
  }, [terraformOperation]);

  // function initHandler() {
  //   setLogs({ logs: "" });
  //   lab &&
  //     toast.promise(initAsync(lab), {
  //       pending: "Initializing Terraform...",
  //       success: "Terraform Initialized.",
  //       error: {
  //         render(data: any) {
  //           return `Failed to initialize terraform. ${data.data.data}`;
  //         },
  //       },
  //     });
  // }

  return (
    <Button
      variant={variant}
      onClick={() =>
        onClickHandler({
          operationType: "init",
          lab: lab,
          operationId: operationId,
        })
      }
      disabled={actionStatus.inProgress}
    >
      {children}
    </Button>
  );
}
