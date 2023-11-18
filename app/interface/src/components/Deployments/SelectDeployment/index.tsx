import { useContext, useState } from "react";
import { ButtonVariant, DeploymentType } from "../../../dataStructures";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import Button from "../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../WebSocketContext";
import { useSelectDeployment } from "../../../hooks/useDeployments";
import { useGetSelectedTerraformWorkspace } from "../../../hooks/useGetSelectedTerraformWorkspace";

type SelectDeploymentProps = {
  variant: ButtonVariant;
  deployment: DeploymentType;
};

export default function SelectDeployment({
  variant,
  deployment,
}: SelectDeploymentProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { actionStatus } = useContext(WebSocketContext);
  const { data: workspaces } = useTerraformWorkspace();
  const { mutateAsync: asyncSelectDeployment } = useSelectDeployment();
  const { selectedTerraformWorkspace } = useGetSelectedTerraformWorkspace();

  if (workspaces === undefined) {
    return (
      <Button variant={variant} disabled={true}>
        Select
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        disabled={
          deployment.deploymentWorkspace === selectedTerraformWorkspace?.name ||
          actionStatus === undefined ||
          actionStatus.inProgress === true
        }
        onClick={() => {
          setShowModal(true);
          asyncSelectDeployment(deployment).finally(() => {
            // wait for 3 seconds for data to be fetched.
            // not an ideal solution, but works for now.
            setTimeout(() => {
              setShowModal(false);
            }, 5000);
          });
        }}
      >
        Select
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
  if (!showModal) return null;
  return (
    <div className="fixed inset-0 z-20 flex max-h-full max-w-full justify-center bg-slate-800 bg-opacity-80 dark:bg-slate-100 dark:bg-opacity-80">
      <div
        className="my-20 h-1/3 w-1/3 items-center space-y-2 divide-y divide-slate-300 overflow-y-auto rounded bg-slate-100 p-5 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex h-full w-full items-center justify-center text-2xl">
          Action is in progress, please wait...
        </div>
      </div>
    </div>
  );
}
