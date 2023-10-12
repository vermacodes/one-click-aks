import { SiTerraform } from "react-icons/si";
import { DeploymentType } from "../../dataStructures";
import Checkbox from "../Checkbox";
import Button from "../Button";
import {
  useSelectWorkspace,
  useSelectedTerraformWorkspace,
} from "../../hooks/useWorkspace";
import DestroyAndDeleteDeployment from "../Deployments/DestroyAndDeleteDeployment";
import { useState } from "react";
import { useUpsertDeployment } from "../../hooks/useDeployments";
import DestroyButton from "../Terraform/DestroyButton";

type Props = {
  deployment: DeploymentType;
};

export default function Deployment({ deployment }: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { data: selectedTerraformWorkspace } = useSelectedTerraformWorkspace();
  const { mutateAsync: asyncSelectWorkspace } = useSelectWorkspace();
  const { mutateAsync: asyncUpsertDeployment } = useUpsertDeployment();

  function handleAutoDeleteChange() {
    console.log("on auto delete : " + deployment.deploymentWorkspace);
    // If deployment is already set to auto delete, then we need to set it to false
    if (deployment.deploymentAutoDelete) {
      asyncUpsertDeployment({
        ...deployment,
        deploymentAutoDelete: !deployment.deploymentAutoDelete,
        deploymentAutoDeleteUnixTime: 0,
      });
      return;
    }

    // If deployment is not set to auto delete, then we need to set it to true
    if (!deployment.deploymentAutoDelete) {
      asyncUpsertDeployment({
        ...deployment,
        deploymentAutoDelete: !deployment.deploymentAutoDelete,
        deploymentAutoDeleteUnixTime: Math.floor(Date.now() / 1000) + 10,
      });
      return;
    }
  }

  return (
    <div
      className={`${
        deployment.deploymentWorkspace === selectedTerraformWorkspace?.name
          ? "outline outline-green-500 dark:outline-green-500"
          : ""
      } mb-3 rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div className="flex justify-between">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
          <h1 className="text-xl text-sky-500">
            {deployment.deploymentWorkspace}
          </h1>
        </div>
        <div className="flex flex-wrap gap-y-2 gap-x-2">
          <Checkbox
            id={"auto-destroy-" + deployment.deploymentWorkspace}
            label="Auto Destroy"
            checked={deployment.deploymentAutoDelete}
            handleOnChange={handleAutoDeleteChange}
            disabled={false}
          />
          <div
            className={`flex w-32 items-center justify-between rounded border border-slate-500 px-2 py-1`}
          >
            8 Hours
          </div>
          <Button
            variant="primary-outline"
            disabled={
              deployment.deploymentWorkspace ===
              selectedTerraformWorkspace?.name
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
          <DestroyButton
            variant="danger-outline"
            lab={deployment.deploymentLab}
            disabled={
              selectedTerraformWorkspace === undefined ||
              deployment.deploymentWorkspace !== selectedTerraformWorkspace.name
            }
          >
            Destroy
          </DestroyButton>

          <DestroyButton
            variant="danger-outline"
            lab={deployment.deploymentLab}
            deleteWorkspace={true}
            deployment={deployment}
            disabled={
              selectedTerraformWorkspace === undefined ||
              deployment.deploymentWorkspace !==
                selectedTerraformWorkspace.name ||
              selectedTerraformWorkspace.name === "default"
            }
          >
            Destroy & Delete
          </DestroyButton>
          {/* <DestroyAndDeleteDeployment
            deployment={deployment}
            variant="secondary-outline"
            deleteWorkspace={false}
          >
            Destroy Resources
          </DestroyAndDeleteDeployment> */}
          {/* <DestroyAndDeleteDeployment
            deployment={deployment}
            deleteWorkspace={true}
          /> */}
        </div>
      </div>
      <Modal showModal={showModal} setShowModal={setShowModal} />
    </div>
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
