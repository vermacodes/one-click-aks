import React, { useContext, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useDeleteLab, useDeleteMyLab } from "../../../hooks/useBlobs";
import { WebSocketContext } from "../../Context/WebSocketContext";
import Button from "../../UserInterfaceComponents/Button";
import ConfirmationModal from "../../UserInterfaceComponents/Modal/ConfirmationModal";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DeleteLabButton({ variant, children, lab }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutateAsync: deleteMyLab } = useDeleteMyLab();
  const { mutateAsync: deleteLab } = useDeleteLab();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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
              return `Failed to delete lab. ${data.data.response.data.error}`;
            },
          },
        });
      } else {
        const response = toast.promise(deleteLab(lab), {
          pending: "Deleting Lab...",
          success: "Lab Deleted.",
          error: {
            render(data: any) {
              return `Failed to delete lab. ${data.data.response.data.error}`;
            },
          },
        });

        response.then(() => {
          navigate(`/labs/${lab.type}`);
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
            <strong>Are you sure?</strong> This will delete all versions.
          </p>
        </ConfirmationModal>
      )}
    </>
  );
}
