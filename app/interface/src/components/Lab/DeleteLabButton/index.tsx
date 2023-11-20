import React, { useContext, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useDeleteLab, useDeleteMyLab } from "../../../hooks/useBlobs";
import Button from "../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../Context/WebSocketContext";
import { toast } from "react-toastify";
import ConfirmationModal from "../../UserInterfaceComponents/Modal/ConfirmationModal";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DeleteLabButton({ variant, children, lab }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutateAsync: deleteLab } = useDeleteLab();
  const { mutateAsync: deleteMyLab } = useDeleteMyLab();
  const [showModal, setShowModal] = useState(false);

  function onClickHandler() {
    setShowModal(true);
  }

  function onConfirmDelete() {
    setShowModal(false);
    if (lab !== undefined) {
      if (lab.type === "template") {
        toast.promise(deleteMyLab(lab), {
          pending: "Deleting Lab...",
          success: "Lab Deleted.",
          error: {
            render(data: any) {
              return `Failed to delete lab. ${data.data.data}`;
            },
          },
        });
      } else {
        toast.promise(deleteLab(lab), {
          pending: "Deleting Lab...",
          success: "Lab Deleted.",
          error: {
            render(data: any) {
              return `Failed to delete lab. ${data.data.data}`;
            },
          },
        });
      }
    }
  }

  return (
    <>
      <Button
        variant={variant}
        onClick={onClickHandler}
        disabled={actionStatus.inProgress || lab === undefined}
      >
        <span>
          <FaTrash />
        </span>
        {children}
      </Button>
      {showModal && (
        <ConfirmationModal
          title="Confirm Delete"
          onClose={() => setShowModal(false)}
          onConfirm={onConfirmDelete}
        >
          <p className="text-2xl">
            Are you sure you want to delete this lab? This is not reversible.
          </p>
        </ConfirmationModal>
      )}
    </>
  );
}
