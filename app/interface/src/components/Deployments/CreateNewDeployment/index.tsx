import { useState } from "react";
import Button from "../../Button";
import { MdClose } from "react-icons/md";
import {
  useAddWorkspace,
  useDeleteWorkspace,
  useGetResources,
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import { useUpsertDeployment } from "../../../hooks/useDeployments";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../../hooks/useActionStatus";
import { useLab } from "../../../hooks/useLab";
import { ButtonVariant } from "../../../dataStructures";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
};

export default function CreateNewDeployment(props: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  return (
    <>
      <Button variant={props.variant} onClick={() => setShowModal(true)}>
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
  const [workspaceMenu, setWorkspaceMenu] = useState<boolean>(false);

  const [add, setAdd] = useState<boolean>(false);
  const [newWorkSpaceName, setNewWorkSpaceName] = useState<string>("");
  const {
    data: workspaces,
    refetch: refetchWorkspaces,
    isLoading: gettingWorkspaces,
    isFetching: fetchingWorkspaces,
    isError: workspaceError,
  } = useTerraformWorkspace();
  const { isFetching: fetchingResources } = useGetResources();
  const { mutate: selectWorkspace, isLoading: selectingWorkspace } =
    useSelectWorkspace();
  const { isLoading: deletingWorkspace } = useDeleteWorkspace();
  const {
    mutate: addWorkspace,
    mutateAsync: asyncAddWorkspace,
    isLoading: addingWorkspace,
  } = useAddWorkspace();
  const { mutate: upsertDeployment } = useUpsertDeployment();
  const { data: actionStatus } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { data: lab } = useLab();

  function handleWorkspaceNameTextField(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setNewWorkSpaceName(event.target.value);
  }

  function handleAddWorkspace() {
    if (lab !== undefined) {
      setActionStatus({ inProgress: true });
      asyncAddWorkspace({ name: newWorkSpaceName, selected: true }).then(() => {
        setActionStatus({ inProgress: false });
        setShowModal(false);
        setNewWorkSpaceName("");
        upsertDeployment({
          deploymentId: "",
          deploymentUserId: "",
          deploymentWorkspace: newWorkSpaceName,
          deploymentAutoDelete: false,
          deploymentAutoDeleteUnixTime: 0,
          deploymentStatus: "notstarted",
          deploymentLab: lab,
        });
      });
    }
    console.error("Lab is undefined");
  }

  if (!showModal) return null;
  return (
    <div
      className="fixed inset-0 z-20 flex max-h-full max-w-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
      }}
    >
      <div
        className="my-20 h-1/3 w-1/3 space-y-2 divide-y divide-slate-300 overflow-y-auto overflow-x-hidden rounded bg-slate-100 p-5 scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
          setWorkspaceMenu(false);
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
          <div
            className="flex w-full justify-between gap-x-4"
            onDoubleClick={() => refetchWorkspaces}
          >
            {actionStatus === false ? (
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
                <Button variant="success" onClick={() => handleAddWorkspace()}>
                  Add
                </Button>
              </>
            ) : (
              <div className={`flex w-96 items-center justify-between`}>
                Action is in progress, please wait...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
