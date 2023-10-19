import { useContext, useState } from "react";
import { ButtonVariant, DeploymentType } from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import {
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import { getSelectedTerraformWorkspace } from "../../../utils/helpers";
import Button from "../../Button";
import { WebSocketContext } from "../../../WebSocketContext";

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
  const { mutateAsync: asyncSelectWorkspace } = useSelectWorkspace();

  if (workspaces === undefined) {
    return (
      <Button variant={variant} disabled={true}>
        Select
      </Button>
    );
  }

  const selectedTerraformWorkspace = getSelectedTerraformWorkspace(workspaces);
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
          console.log("on select : " + deployment.deploymentWorkspace);
          asyncSelectWorkspace({
            name: deployment.deploymentWorkspace,
            selected: true,
          }).finally(() => {
            // wait for 3 seconds for data to be fetched.
            // not an ideal solution, but works for now.
            setTimeout(() => {
              setShowModal(false);
            }, 3000);
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
    <div className="fixed inset-0 z-20 flex max-h-full max-w-full justify-center bg-slate-800 dark:bg-slate-100 dark:bg-opacity-80">
      <div
        className="my-20 h-1/3 w-1/3 items-center space-y-2 divide-y divide-slate-300 overflow-y-auto overflow-x-hidden rounded bg-slate-100 p-5 scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-900 dark:scrollbar-thumb-slate-600"
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
