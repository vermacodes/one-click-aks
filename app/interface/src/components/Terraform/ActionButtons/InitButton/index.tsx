import Button from "../../../UserInterfaceComponents/Button";
import { useLab } from "../../../../hooks/useLab";
import { v4 as uuid } from "uuid";
import { useWebSocketContext } from "../../../Context/WebSocketContext";
import { ButtonVariant } from "../../../../dataStructures";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
};

export default function InitButton({ variant, children }: Props) {
  const { actionStatus } = useWebSocketContext();
  const { data: lab } = useLab();
  const { onClickHandler } = useTerraformOperation();

  return (
    <Button
      variant={variant}
      onClick={() =>
        onClickHandler({
          operationType: "init",
          lab: lab,
          operationId: uuid(),
        })
      }
      disabled={actionStatus.inProgress}
    >
      {children}
    </Button>
  );
}
