import React, { useContext } from "react";
import { FaTrash } from "react-icons/fa";
import { ButtonVariant, DeploymentType, Lab } from "../../../../dataStructures";
import { useSetLogs } from "../../../../hooks/useLogs";
import { usePreference } from "../../../../hooks/usePreference";
import { useDestroy } from "../../../../hooks/useTerraform";
import Button from "../../../UserInterfaceComponents/Button";
import { useTerraformWorkspace } from "../../../../hooks/useWorkspace";
import {
  useDeleteDeployment,
  useGetMyDeployments,
  usePatchDeployment,
} from "../../../../hooks/useDeployments";
import { WebSocketContext } from "../../../../WebSocketContext";
import ConfirmationModal from "../../../UserInterfaceComponents/Modal/ConfirmationModal";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";

type Props = {
  variant: ButtonVariant;
  navbarButton?: boolean;
  deleteWorkspace?: boolean;
  deployment?: DeploymentType;
  disabled?: boolean;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DestroyButton({
  variant,
  navbarButton,
  deleteWorkspace,
  deployment,
  disabled,
  children,
  lab,
}: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: destroyAsync } = useDestroy();
  const { actionStatus } = useContext(WebSocketContext);
  const { data: preference } = usePreference();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { mutate: patchDeployment } = usePatchDeployment();
  const { mutateAsync: deleteDeploymentAsync } = useDeleteDeployment();
  const [showModal, setShowModal] = React.useState(false);

  function onClickHandler() {
    setShowModal(true);
  }

  const { onClickHandler: onConfirmDelete } = useTerraformOperation();

  // function updateDeploymentStatus(
  //   deployment: DeploymentType | undefined,
  //   status: DeploymentType["deploymentStatus"]
  // ) {
  //   if (deployment !== undefined) {
  //     patchDeployment({
  //       ...deployment,
  //       deploymentStatus: status,
  //     });
  //   }
  // }

  // async function checkStatusAsync(
  //   operationId: string
  // ): Promise<TerraformOperation> {
  //   try {
  //     const response = await axiosInstance.get(
  //       `/terraform/status/${operationId}`
  //     );
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async function checkDeploymentStatus(
  //   operation: TerraformOperation,
  //   deployment: DeploymentType
  // ) {
  //   const intervalId = setInterval(async () => {
  //     const terraformOp = await checkStatusAsync(operation.operationId);
  //     if (!terraformOp.inProgress) {
  //       if (terraformOp.status === "Resources Destroyed") {
  //         toast.success("Resources Destroyed"),
  //           {
  //             autoClose: 5000,
  //           };

  //         updateDeploymentStatus(deployment, "Resources Destroyed");

  //         // handle deleting workspace.
  //         handleDeleteWorkspace();
  //       } else if (terraformOp.status === "Destroy Failed") {
  //         toast.error("Destroy Failed"),
  //           {
  //             autoCLose: 10000,
  //           };
  //         updateDeploymentStatus(deployment, "Destroy Failed");
  //       }
  //       clearInterval(intervalId);
  //     }
  //   }, 10000);
  // }

  // function handleDeleteWorkspace() {
  //   if (
  //     deployment === undefined ||
  //     terraformWorkspaces === undefined ||
  //     !deleteWorkspace
  //   ) {
  //     return;
  //   }

  //   toast.promise(
  //     deleteDeploymentAsync([
  //       deployment.deploymentWorkspace,
  //       deployment.deploymentSubscriptionId,
  //     ]),
  //     {
  //       pending: "Deleting workspace...",
  //       success: {
  //         render(data: any) {
  //           return `Workspace deleted.`;
  //         },
  //         autoClose: 2000,
  //       },
  //       error: {
  //         render(data: any) {
  //           return `Failed to delete workspace. ${data.data.data}`;
  //         },
  //         autoClose: 10000,
  //       },
  //     }
  //   );
  // }

  // function onConfirmDelete() {
  //   setShowModal(false);
  //   // if lab is undefined, do nothing
  //   if (
  //     lab === undefined ||
  //     terraformWorkspaces === undefined ||
  //     deployments === undefined
  //   ) {
  //     toast.error(
  //       "Something isn't right. Try 'Reset Server Cache' from settings."
  //     );
  //     return;
  //   }

  //   // update lab's azure region based on users preference
  //   if (lab.template !== undefined && preference !== undefined) {
  //     lab.template.resourceGroup.location = preference.azureRegion;
  //   }

  //   // reset logs.
  //   setLogs({ logs: "" });

  //   //get the deployment for the selected workspace
  //   const deployment = getSelectedDeployment(deployments, terraformWorkspaces);
  //   if (deployment === undefined) {
  //     toast.error(
  //       "No deployment selected. Try 'Reset Server Cache' from settings."
  //     );
  //     return;
  //   }

  //   updateDeploymentStatus(deployment, "Destroying Resources");

  //   // destroy terraform
  //   const response = toast.promise(destroyAsync(lab), {
  //     pending: "Starting Destroy",
  //     success: {
  //       render(data: any) {
  //         return `Destroy started.`;
  //       },
  //       autoClose: 5000,
  //     },
  //     error: {
  //       render(data: any) {
  //         return `Destroy failed. ${data.data.data}`;
  //       },
  //       autoClose: 10000,
  //     },
  //   });

  //   response
  //     .then((data) => {
  //       checkDeploymentStatus(data.data, deployment);
  //     })
  //     .catch(() => {
  //       updateDeploymentStatus(deployment, "Destroy Failed");
  //     });
  // }

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
              lab: lab,
              inProgressStatus: "Destroying Resources",
              failedStatus: "Destroy Failed",
              completedStatus: "Resources Destroyed",
              extendLifespan: false,
              deleteWorkspace: deleteWorkspace || false,
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
