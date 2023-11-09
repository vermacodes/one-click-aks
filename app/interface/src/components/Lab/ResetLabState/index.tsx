import { toast } from "react-toastify";
import Button from "../../UserInterfaceComponents/Button";
import { FaRedo } from "react-icons/fa";
import { useSetLogs } from "../../../hooks/useLogs";
import { useDeleteLab } from "../../../hooks/useLab";
import { ButtonVariant } from "../../../dataStructures";

type Props = {
  buttonVariant?: ButtonVariant;
  children?: React.ReactNode;
};

export default function ResetLabState({ buttonVariant, children }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: deleteLab } = useDeleteLab();

  function handleResetLabState() {
    setLogs({
      logs: "",
    });
    toast.promise(
      deleteLab(),
      {
        pending: "Resetting lab state...",
        success: "Lab state reset completed.",
        error: {
          //TODO: any ain't good. Fix this.
          render(data: any) {
            console.log("Data:", data);
            return `Lab state reset failed: ${data.data.data}`;
          },

          autoClose: false,
        },
      },
      {
        toastId: "reset-lab",
        autoClose: 1500,
      }
    );
  }

  return (
    <Button
      variant={buttonVariant ? buttonVariant : "secondary-text"}
      onClick={() => handleResetLabState()}
    >
      {children ? (
        children
      ) : (
        <>
          <FaRedo /> Reset
        </>
      )}
    </Button>
  );
}
