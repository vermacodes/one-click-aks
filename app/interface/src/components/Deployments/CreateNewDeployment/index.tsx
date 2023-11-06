import { useContext, useState } from "react";
import Button from "../../UserInterfaceComponents/Button";
import { MdClose } from "react-icons/md";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import {
  useAddDeployment,
  useGetMyDeployments,
} from "../../../hooks/useDeployments";
import { useSetActionStatus } from "../../../hooks/useActionStatus";
import { useLab } from "../../../hooks/useLab";
import { ButtonVariant } from "../../../dataStructures";
import { WebSocketContext } from "../../../WebSocketContext";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
};

export default function CreateNewDeployment(props: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { actionStatus } = useContext(WebSocketContext);
  return (
    <>
      <Button
        variant={props.variant}
        onClick={() => setShowModal(true)}
        disabled={actionStatus.inProgress}
      >
        {props.children}
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
    const isValid = validateInput(value);

    setNewWorkSpaceName(value); // Always update the input
    setIsModified(true); // Set isModified to true when the user modifies the input

    if (isValid) {
      setErrorMessage(""); // Clear the error message
    } else {
      setErrorMessage("Invalid input. Please enter a valid name.");
    }
  }

  function handleAddWorkspace() {
    if (lab === undefined) {
      console.error("Lab is undefined");
      setShowModal(false);
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
        setShowModal(false);
      }, 3000);
    });
  }

  const validateInput = (input: string) => {
    // Check if input is at least one character long
    if (input.length < 1) {
      return false;
    }

    // Check if input does not exceed 255 characters in length
    if (input.length > 255) {
      return false;
    }

    // Check if input consists of letters, numbers, colons, hyphens, and underscores
    const regex = /^[a-zA-Z0-9:_-]*$/;
    if (!regex.test(input)) {
      return false;
    }

    return true;
  };

  if (!showModal) return null;
  return (
    <div
      className="fixed inset-0 z-20 flex max-h-full max-w-full justify-center bg-slate-800 bg-opacity-80 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={(e) => {
        setShowModal(false);
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
            onClick={() => setShowModal(false)}
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
                <div
                  className={`flex w-96 items-center justify-between rounded border border-slate-500`}
                >
                  <input
                    type="text"
                    className="block h-10 w-full bg-inherit px-2 text-inherit"
                    placeholder="Name your new deployment."
                    value={newWorkSpaceName}
                    onChange={handleWorkspaceNameTextField}
                  ></input>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleAddWorkspace()}
                  disabled={
                    !validateInput(newWorkSpaceName) ||
                    actionStatus.inProgress ||
                    fetchingDeployments ||
                    fetchingWorkspaces ||
                    loadingDeployments ||
                    loadingWorkspaces
                  }
                >
                  Create
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </>
            )}
          </div>
          {isModified && errorMessage && (
            <div className="rounded border border-rose-500 bg-rose-500 bg-opacity-20 p-2">
              <p className="error-message">{errorMessage}</p>
              <p className="text-xs">
                Deployment name must: Be at least one character long. Not exceed
                255 characters in length. Consist of letters, numbers, colons,
                hyphens, or underscores only.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
