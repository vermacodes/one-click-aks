import { toast } from "react-toastify";
import Button from "../../UserInterfaceComponents/Button";
import { FaRedo } from "react-icons/fa";
import { useSetLogs } from "../../../hooks/useLogs";
import { useDeleteLab } from "../../../hooks/useLab";
import { ButtonVariant } from "../../../dataStructures";
import { useState } from "react";
import ConfirmationModal from "../../UserInterfaceComponents/Modal/ConfirmationModal";

type Props = {
  buttonVariant?: ButtonVariant;
  children?: React.ReactNode;
};

export default function ResetLabState({ buttonVariant, children }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: deleteLab } = useDeleteLab();
  const [showModal, setShowModal] = useState(false);

  function onClickHandler() {
    setShowModal(true);
  }

  function handleResetLabState() {
    setShowModal(false);
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
    <>
      <Button
        variant={buttonVariant ? buttonVariant : "secondary-text"}
        onClick={() => onClickHandler()}
      >
        {children ? (
          children
        ) : (
          <>
            <FaRedo /> Reset
          </>
        )}
      </Button>
      {showModal && (
        <ConfirmationModal
          onClose={() => setShowModal(false)}
          onConfirm={handleResetLabState}
          title="Confirm Lab Reset"
        >
          <p className="text-xl">
            <strong>Are you sure?</strong> This will irreversibly reset all
            changes you made to lab including the extension script.
          </p>
        </ConfirmationModal>
      )}
    </>
  );
}
