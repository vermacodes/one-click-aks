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
  const { isFetching: fetchingWorkspaces, isLoading: loadingWorkspaces } =
    useTerraformWorkspace();
  const { isFetching: fetchingDeployments, isLoading: loadingDeployments } =
    useGetMyDeployments();
  const { mutateAsync: addDeployment } = useAddDeployment();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setActionStatus } = useSetActionStatus();
  const { data: lab } = useLab();

  function handleWorkspaceNameTextField(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setNewWorkSpaceName(event.target.value);
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

  if (!showModal) return null;
  return (
    <div
      className="fixed inset-0 z-20 flex max-h-full max-w-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={(e) => {
        setShowModal(false);
        e.stopPropagation();
      }}
    >
      <div
        className="my-20 h-1/3 w-1/3 space-y-2 divide-y divide-slate-300 overflow-y-auto overflow-x-hidden rounded bg-slate-100 p-5 scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
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
                <Button variant="primary" onClick={() => handleAddWorkspace()}>
                  Add
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
