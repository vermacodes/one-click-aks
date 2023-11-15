import { useContext, useState } from "react";
import { z } from "zod";
import Button from "../../UserInterfaceComponents/Button";
import { MdClose } from "react-icons/md";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import {
  useAddDeployment,
  useGetMyDeployments,
} from "../../../hooks/useDeployments";
import { useLab } from "../../../hooks/useLab";
import { ButtonVariant } from "../../../dataStructures";
import { WebSocketContext } from "../../../WebSocketContext";
import { deploymentNameSchema } from "../../../zodSchemas";

type Props = {
  variant: ButtonVariant;
  tooltipMessage?: string;
  tooltipDelay?: number;
  children: React.ReactNode;
};

export default function CreateNewDeployment({
  variant,
  tooltipMessage,
  tooltipDelay,
  children,
}: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { actionStatus } = useContext(WebSocketContext);
  return (
    <>
      <Button
        variant={variant}
        tooltipMessage={tooltipMessage}
        tooltipDelay={tooltipDelay}
        onClick={() => setShowModal(true)}
        disabled={actionStatus.inProgress}
      >
        {children}
      </Button>
      <Modal showModal={showModal} setShowModal={setShowModal} />
    </>
  );
}

type ModalProps = {
  showModal: boolean;
  setShowModal(args: boolean): void;
};

function Modal({ showModal, setShowModal }: ModalProps) {
  const [newWorkSpaceName, setNewWorkSpaceName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isModified, setIsModified] = useState<boolean>(false);
  const { isFetching: fetchingWorkspaces, isLoading: loadingWorkspaces } =
    useTerraformWorkspace();
  const { isFetching: fetchingDeployments, isLoading: loadingDeployments } =
    useGetMyDeployments();
  const { mutateAsync: addDeployment } = useAddDeployment();
  const { actionStatus } = useContext(WebSocketContext);
  const { data: lab } = useLab();

  function handleWorkspaceNameTextField(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    setNewWorkSpaceName(value); // Always update the input
    setIsModified(true); // Set isModified to true when the user modifies the input

    // Validate the input
    const result = deploymentNameSchema.safeParse(value);

    if (result.success) {
      setErrorMessage(""); // Clear the error message
    } else {
      // Join all error messages into a single string
      const errorMessages = result.error.errors
        .map((err) => err.message)
        .join(" ");
      setErrorMessage(errorMessages);
    }
  }

  function handleAddWorkspace() {
    if (lab === undefined) {
      console.error("Lab is undefined");
      handleModalClose();
      return;
    }
    addDeployment({
      deploymentId: "",
      deploymentUserId: "",
      deploymentWorkspace: newWorkSpaceName,
      deploymentSubscriptionId: "",
      deploymentAutoDelete: false,
      deploymentAutoDeleteUnixTime: 0,
      deploymentLifespan: 28800,
      deploymentStatus: "Deployment Not Started",
      deploymentLab: lab,
    }).finally(() => {
      setTimeout(() => {
        handleModalClose();
      }, 3000);
    });
  }

  // Close the modal and reset the state
  const handleModalClose = () => {
    setIsModified(false);
    setShowModal(false);
  };

  if (!showModal) return null;
  return (
    <div
      className="fixed inset-0 z-20 flex max-h-full max-w-full justify-center bg-slate-800 bg-opacity-80 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={(e) => {
        handleModalClose();
        e.stopPropagation();
      }}
    >
      <div
        className="my-20 h-1/3 w-1/3 space-y-2 divide-y divide-slate-300 overflow-y-auto rounded bg-slate-100 p-5 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 flex justify-between pb-2 ">
          <h1 className="text-3xl">New Deployment</h1>
          <button
            onClick={() => handleModalClose()}
            className="hover:text-sky-500"
          >
            <MdClose className="text-3xl" />
          </button>
        </div>
        <div className="flex flex-col gap-y-2 pt-4">
          <div className="flex w-full justify-between gap-x-4">
            {actionStatus.inProgress !== false ||
            fetchingDeployments ||
            fetchingWorkspaces ||
            loadingDeployments ||
            loadingWorkspaces ? (
              <div className={`flex w-96 items-center justify-between`}>
                Action is in progress, please wait...
              </div>
            ) : (
              <>
                <input
                  type="text"
                  aria-label="New Deployment Name"
                  className={`${
                    isModified &&
                    errorMessage &&
                    "border-rose-500  focus:ring-rose-500"
                  } block h-10 w-full rounded border border-slate-500 bg-inherit px-2 text-inherit focus:outline-none focus:ring-1 focus:ring-slate-500`}
                  placeholder="Name your new deployment."
                  value={newWorkSpaceName}
                  onChange={handleWorkspaceNameTextField}
                />
                <Button
                  variant="primary"
                  onClick={() => handleAddWorkspace()}
                  disabled={
                    !deploymentNameSchema.safeParse(newWorkSpaceName).success ||
                    actionStatus.inProgress ||
                    fetchingDeployments ||
                    fetchingWorkspaces ||
                    loadingDeployments ||
                    loadingWorkspaces
                  }
                >
                  Create
                </Button>
                <Button variant="secondary" onClick={() => handleModalClose()}>
                  Cancel
                </Button>
              </>
            )}
          </div>
          {isModified && errorMessage && (
            <div className="rounded border border-rose-500 bg-rose-500 bg-opacity-20 p-2">
              <p className="error-message">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
