import React, { useContext, useState } from "react";
import { FaTrash } from "react-icons/fa";
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
  // const { mutateAsync: deletePrivateLab } = useDeletePrivateLab();
  // const { mutateAsync: deletePublicLab } = useDeletePublicLab();
  // const { mutateAsync: deleteProtectedLab } = useDeleteProtectedLab();
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
              return `Failed to delete lab. ${data.data.response.data.error}`;
            },
          },
        });
      } else {
        toast.promise(deleteLab(lab), {
          pending: "Deleting Lab...",
          success: "Lab Deleted.",
          error: {
            render(data: any) {
              return `Failed to delete lab. ${data.data.response.data.error}`;
            },
          },
        });
      }
      // if (lab.type === "publiclab") {
      //   toast.promise(deletePublicLab(lab), {
      //     pending: "Deleting Lab...",
      //     success: "Lab Deleted.",
      //     error: {
      //       render(data: any) {
      //         return `Failed to delete lab. ${data.data.response.data.error}`;
      //       },
      //     },
      //   });
      // }
      // if (lab.type === "readinesslab") {
      //   toast.promise(deleteProtectedLab(lab), {
      //     pending: "Deleting Lab...",
      //     success: "Lab Deleted.",
      //     error: {
      //       render(data: any) {
      //         return `Failed to delete lab. ${data.data.response.data.error}`;
      //       },
      //     },
      //   });
      // }
      // if (lab.type === "mockcase") {
      //   toast.promise(deleteProtectedLab(lab), {
      //     pending: "Deleting Lab...",
      //     success: "Lab Deleted.",
      //     error: {
      //       render(data: any) {
      //         return `Failed to delete lab. ${data.data.response.data.error}`;
      //       },
      //     },
      //   });
      // }
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
