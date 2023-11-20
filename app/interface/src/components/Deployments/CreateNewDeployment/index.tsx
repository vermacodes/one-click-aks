import { useContext, useEffect, useState } from "react";
import Button from "../../UserInterfaceComponents/Button";
import { MdClose } from "react-icons/md";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import {
  useAddDeployment,
  useGetMyDeployments,
} from "../../../hooks/useDeployments";
import { useLab } from "../../../hooks/useLab";
import { ButtonVariant } from "../../../dataStructures";
import { WebSocketContext } from "../../Context/WebSocketContext";
import { deploymentNameSchema } from "../../../zodSchemas";
import PleaseWaitModal from "../../UserInterfaceComponents/Modal/PleaseWaitModal";
import { useQueryClient } from "react-query";
import { useSelectedDeployment } from "../../../hooks/useSelectedDeployment";
import ModalBackdrop from "../../UserInterfaceComponents/Modal/ModalBackdrop";
import { useDefaultAccount } from "../../../hooks/useDefaultAccount";

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
  const [newWorkSpaceName, setNewWorkSpaceName] = useState<string>("");
  const [isNewWorkspaceNameModified, setIsNewWorkspaceNameModified] =
    useState<boolean>(false);
  const { actionStatus } = useContext(WebSocketContext);
  const [showPleaseWaitModal, setShowPleaseWaitModal] =
    useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const { mutateAsync: addDeployment } = useAddDeployment();
  const { data: lab } = useLab();
  const queryClient = useQueryClient();
  const { selectedDeployment } = useSelectedDeployment();
  const { defaultAccount } = useDefaultAccount();

  useEffect(() => {
    if (selectedDeployment?.deploymentWorkspace === newWorkSpaceName) {
      setModalMessage("✅ All done.");
      setTimeout(() => {
        setShowPleaseWaitModal(false);
        setNewWorkSpaceName("");
      }, 2000);
    }
  }, [selectedDeployment]);

  // Close the modal and reset the state
  const handleModalClose = () => {
    setIsNewWorkspaceNameModified(false);
    setShowModal(false);
  };

  function handleAddWorkspace() {
    if (lab === undefined) {
      console.error("Lab is undefined");
      handleModalClose();
      return;
    }

    if (defaultAccount === undefined) {
      console.error("Default subscription is undefined");
      handleModalClose();
      return;
    }

    setModalMessage("⌛ Adding deployment, Please wait...");
    setShowPleaseWaitModal(true);
    handleModalClose();

    addDeployment({
      deploymentId: "",
      deploymentUserId: "",
      deploymentWorkspace: newWorkSpaceName,
      deploymentSubscriptionId: defaultAccount.id,
      deploymentAutoDelete: false,
      deploymentAutoDeleteUnixTime: 0,
      deploymentLifespan: 28800,
      deploymentStatus: "Deployment Not Started",
      deploymentLab: lab,
    })
      .then(() => {
        setModalMessage("⌛ Almost done. Please wait...");
        queryClient.invalidateQueries(["list-deployments"]);

        setTimeout(() => {
          setModalMessage("❌ Failed to add deployment.");
          setTimeout(() => {
            setShowPleaseWaitModal(false);
            setNewWorkSpaceName("");
          }, 5000);
        }, 60000);
      })
      .catch(() => {
        setModalMessage("❌ Failed to add deployment.");
        setTimeout(() => {
          setShowPleaseWaitModal(false);
          setNewWorkSpaceName("");
        }, 5000);
      });
  }

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
      {showModal && (
        <Modal
          setShowModal={setShowModal}
          newWorkSpaceName={newWorkSpaceName}
          setNewWorkSpaceName={setNewWorkSpaceName}
          handleAddWorkspace={handleAddWorkspace}
          isNewWorkspaceNameModified={isNewWorkspaceNameModified}
          setIsNewWorkspaceNameModified={setIsNewWorkspaceNameModified}
          handleModalClose={handleModalClose}
        />
      )}
      {showPleaseWaitModal && <PleaseWaitModal modalMessage={modalMessage} />}
    </>
  );
}

type ModalProps = {
  setShowModal(args: boolean): void;
  newWorkSpaceName: string;
  setNewWorkSpaceName(args: string): void;
  handleAddWorkspace(): void;
  isNewWorkspaceNameModified: boolean;
  setIsNewWorkspaceNameModified(args: boolean): void;
  handleModalClose(): void;
};

function Modal({
  newWorkSpaceName,
  setNewWorkSpaceName,
  handleAddWorkspace,
  isNewWorkspaceNameModified,
  setIsNewWorkspaceNameModified,
  handleModalClose,
}: ModalProps) {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);

  function handleWorkspaceNameTextField(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;
    setNewWorkSpaceName(value);
    setIsNewWorkspaceNameModified(true);

    const result = deploymentNameSchema.safeParse(value);

    if (result.success) {
      setErrorMessage("");
    } else {
      const errorMessages = result.error.errors
        .map((err) => err.message)
        .join(" ");
      setErrorMessage(errorMessages);
    }
  }

  return (
    <ModalBackdrop
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        handleModalClose();
        e.stopPropagation();
      }}
    >
      <div
        className="my-20 h-[35%] max-h-80 w-1/3 space-y-2 divide-y divide-slate-300 overflow-y-auto rounded bg-slate-100 p-5 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
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
          <div className="flex gap-x-2">
            <input
              type="text"
              aria-label="New Deployment Name"
              className={`${
                isNewWorkspaceNameModified && errorMessage
                  ? "border-rose-500 focus:ring-rose-500"
                  : "focus:ring-slate-500"
              } block h-10 w-full rounded border border-slate-500 bg-inherit px-2 text-inherit focus:outline-none focus:ring-1`}
              placeholder="Name your new deployment."
              value={newWorkSpaceName}
              onChange={handleWorkspaceNameTextField}
            />
            <Button
              variant="primary"
              onClick={() => handleAddWorkspace()}
              disabled={
                !deploymentNameSchema.safeParse(newWorkSpaceName).success ||
                actionStatus.inProgress
              }
            >
              Create
            </Button>
            <Button variant="secondary" onClick={() => handleModalClose()}>
              Cancel
            </Button>
          </div>
          {isNewWorkspaceNameModified && errorMessage && (
            <div className="rounded border border-rose-500 bg-rose-500 bg-opacity-20 p-2">
              <p className="error-message">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
