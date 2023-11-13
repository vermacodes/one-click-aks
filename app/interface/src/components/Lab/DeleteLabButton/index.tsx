import React, { useContext } from "react";
import { FaTrash } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useDeleteLab, useDeleteMyLab } from "../../../hooks/useBlobs";
import Button from "../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../WebSocketContext";
import { toast } from "react-toastify";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DeleteLabButton({ variant, children, lab }: Props) {
  const { actionStatus } = useContext(WebSocketContext);
  const { mutateAsync: deleteLab } = useDeleteLab();
  const { mutateAsync: deleteMyLab } = useDeleteMyLab();

  function onClickHandler() {
    //setLogs({ logs: "" });
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
  );
}
