import { useState } from "react";
import { FaRedo } from "react-icons/fa";
import { toast } from "react-toastify";
import { ButtonVariant } from "../../../dataStructures";
import { useDeleteLab, useLab } from "../../../hooks/useLab";
import { useSetLogs } from "../../../hooks/useLogs";
import { useGlobalStateContext } from "../../Context/GlobalStateContext";
import Button from "../../UserInterfaceComponents/Button";
import ConfirmationModal from "../../UserInterfaceComponents/Modal/ConfirmationModal";

type Props = {
  buttonVariant?: ButtonVariant;
  children?: React.ReactNode;
};

export default function ResetLabState({ buttonVariant, children }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: deleteLab } = useDeleteLab();
  const { refetch } = useLab();
  const { setSyncLab } = useGlobalStateContext();
  const [showModal, setShowModal] = useState(false);

  function onClickHandler() {
    setShowModal(true);
  }

  async function handleResetLabState() {
    setShowModal(false);
    setLogs({
      logs: "",
    });

    const labResetPromise = async () => {
      // Await the deleteLab function
      await deleteLab();

      // Set syncLab to true
      setSyncLab(true);

      // Refetch data
      await refetch();
    };

    toast.promise(
      labResetPromise(),
      {
        pending: "Resetting lab...",
        success: "Lab reset completed.",
        error: "Lab reset failed.",
      },
      {
        toastId: "reset-lab",
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
