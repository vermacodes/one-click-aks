import { DeploymentType } from "../../../dataStructures";
import Button from "../../Button";
import {
  useSelectWorkspace,
  useSelectedTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import { useState } from "react";
import DestroyButton from "../../Terraform/DestroyButton";
import AutoDestroySwitch from "../AutoDestroySwitch";
import { getDeploymentDestroyTime } from "../../../utils/helpers";
import DestroyTime from "../DestroyTime";
import DeploymentLifespan from "../DeploymentLifespan";

type Props = {
  deployment: DeploymentType;
};

export default function Deployment({ deployment }: Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { data: selectedTerraformWorkspace } = useSelectedTerraformWorkspace();
  const { mutateAsync: asyncSelectWorkspace } = useSelectWorkspace();

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
        <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
          <p>{deployment.deploymentStatus}</p>
          <AutoDestroySwitch
            deployment={deployment}
            disabled={false}
            label="Auto Destroy"
            key={deployment.deploymentId}
          />
          <DeploymentLifespan deployment={deployment} />
          <DestroyTime deployment={deployment} />

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
            Delete
          </DestroyButton>
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
