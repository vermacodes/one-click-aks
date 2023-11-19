import React, { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { FaTrash } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import { useWebSocketContext } from "../../../../WebSocketContext";
import ConfirmationModal from "../../../UserInterfaceComponents/Modal/ConfirmationModal";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";
import { toast } from "react-toastify";
import { useSelectedDeployment } from "../../../../hooks/useSelectedDeployment";

type Props = {
  variant: ButtonVariant;
  navbarButton?: boolean;
  deleteWorkspace?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DestroyButton({
  variant,
  navbarButton,
  deleteWorkspace,
  disabled,
  children,
  lab,
}: Props) {
  const { actionStatus, terraformOperation } = useWebSocketContext();
  const { selectedDeployment: deployment } = useSelectedDeployment();

  const [showModal, setShowModal] = React.useState(false);
  const [operationId, setOperationId] = React.useState<string>(uuid());

  function onClickHandler() {
    setShowModal(true);
  }

  const {
    onClickHandler: onConfirmDelete,
    deleteDeployment,
    updateDeploymentStatus,
  } = useTerraformOperation();

  useEffect(() => {
    // get the operationId from localStorage
    let operationIdFromLocalStorage = localStorage.getItem(
      deployment?.deploymentWorkspace +
        "-" +
        (deleteWorkspace ? "delete" : "destroy") +
        "-operation-id"
    );
    if (operationIdFromLocalStorage !== null) {
      setOperationId(operationIdFromLocalStorage);
    }
  }, []);

  useEffect(() => {
    if (terraformOperation.operationId === operationId) {
      updateDeploymentStatus({
        deployment: deployment,
        status: terraformOperation.status,
      });

      if (terraformOperation.status === "Destroy Failed") {
        toast.error(terraformOperation.status);
        setOperationId(uuid());

        // remove the operationId from localStorage
        if (deployment !== undefined) {
          localStorage.removeItem(
            deployment.deploymentWorkspace +
              "-" +
              (deleteWorkspace ? "delete" : "destroy") +
              "-operation-id"
          );
        }
      }
      if (terraformOperation.status === "Destroy Completed") {
        console.log("Destroy Completed");
        toast.success(terraformOperation.status);
        setOperationId(uuid());
        deleteWorkspace && deleteDeployment({ deployment: deployment });

        // remove the operationId from localStorage
        if (deployment !== undefined) {
          localStorage.removeItem(
            deployment.deploymentWorkspace +
              "-" +
              (deleteWorkspace ? "delete" : "destroy") +
              "-operation-id"
          );
        }
      }
      if (terraformOperation.status === "Destroy In Progress") {
        toast.info(terraformOperation.status);

        // store the operationId in localStorage
        if (deployment !== undefined) {
          localStorage.setItem(
            deployment.deploymentWorkspace +
              "-" +
              (deleteWorkspace ? "delete" : "destroy") +
              "-operation-id",
            operationId
          );
        }
      }
    }
  }, [terraformOperation]);

  // This is used by Navbar
  if (navbarButton) {
    return (
      <button
        className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base disabled:cursor-not-allowed disabled:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
        onClick={onClickHandler}
        disabled={actionStatus.inProgress || lab === undefined || disabled}
      >
        {children}
      </button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        onClick={onClickHandler}
        disabled={actionStatus.inProgress || lab === undefined || disabled}
      >
        <span className="text-base">
          <FaTrash />
        </span>
        {children}
      </Button>
      {showModal && (
        <ConfirmationModal
          title={"Confirm Destroy" + (deleteWorkspace ? " and Delete" : "")}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            onConfirmDelete({
              operationType: "destroy",
              operationId: operationId,
              lab: lab,
            });
          }}
        >
          <p className="text-2xl">
            Are you sure you want to destroy resources{" "}
            {deleteWorkspace ? " and delete " : " of "} this deployment? This is
            not reversible.
          </p>
        </ConfirmationModal>
      )}
    </>
  );
}
