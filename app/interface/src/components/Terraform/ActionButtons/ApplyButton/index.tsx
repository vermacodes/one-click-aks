import React, { useContext } from "react";
import { FaRocket } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import { useSetLogs } from "../../../../hooks/useLogs";
import { usePreference } from "../../../../hooks/usePreference";
import { useApply } from "../../../../hooks/useTerraform";
import Button from "../../../UserInterfaceComponents/Button";
import {
  useGetMyDeployments,
  usePatchDeployment,
} from "../../../../hooks/useDeployments";
import { useTerraformWorkspace } from "../../../../hooks/useWorkspace";
import { WebSocketContext } from "../../../../WebSocketContext";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ApplyButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: applyAsync } = useApply();
  const { actionStatus } = useContext(WebSocketContext);
  const { data: preference } = usePreference();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { mutate: patchDeployment } = usePatchDeployment();

  // function updateDeploymentStatus(
  //   deployment: DeploymentType | undefined,
  //   status: DeploymentType["deploymentStatus"]
  // ) {
  //   if (deployment !== undefined) {
  //     const updatedDeployment = {
  //       ...deployment,
  //       deploymentStatus: status,
  //     };

  //     // if deployment is auto delete, update the unix time
  //     if (deployment.deploymentAutoDelete) {
  //       updatedDeployment.deploymentAutoDeleteUnixTime =
  //         calculateNewEpochTimeForDeployment(deployment);
  //     }

  //     patchDeployment(updatedDeployment);
  //   }
  // }

  // async function checkDeploymentStatus(
  //   operation: TerraformOperation,
  //   deployment: DeploymentType
  // ) {
  //   const intervalId = setInterval(async () => {
  //     const { data: terraformOp } = useTerraformOperationStatus(
  //       operation.operationId
  //     );
  //     if (terraformOp === undefined || terraformOp.inProgress) {
  //       return;
  //     }

  //     if (terraformOp.status === "Deployment Completed") {
  //       toast.success("Deployment Completed"),
  //         {
  //           autoClose: 5000,
  //         };
  //       updateDeploymentStatus(deployment, "Deployment Completed");
  //     } else if (terraformOp.status === "Deployment Failed") {
  //       toast.error("Deployment Failed"),
  //         {
  //           autoCLose: 10000,
  //         };
  //       updateDeploymentStatus(deployment, "Deployment Failed");
  //     }
  //     clearInterval(intervalId);
  //   }, 10000);
  // }

  // function onClickHandler() {
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

  //   if (lab.template !== undefined && preference !== undefined) {
  //     lab.template.resourceGroup.location = preference.azureRegion;
  //   }

  //   setLogs({ logs: "" });

  //   const deployment = getSelectedDeployment(deployments, terraformWorkspaces);
  //   if (deployment === undefined) {
  //     toast.error(
  //       "No deployment selected. Try 'Reset Server Cache' from settings."
  //     );
  //     return;
  //   }

  //   updateDeploymentStatus(deployment, "Deployment In Progress");

  //   const response = toast.promise(applyAsync(lab), {
  //     pending: "Starting deployment...",
  //     success: {
  //       render(data: any) {
  //         return `Deployment started.`;
  //       },
  //       autoClose: 5000,
  //     },
  //     error: {
  //       render(data: any) {
  //         return `Deployment Failed. ${data.data.data}`;
  //       },
  //       autoClose: 10000,
  //     },
  //   });

  //   response
  //     .then((data) => {
  //       checkDeploymentStatus(data.data, deployment);
  //     })
  //     .catch(() => {
  //       updateDeploymentStatus(deployment, "Deployment Failed");
  //     });
  // }

  const { onClickHandler } = useTerraformOperation();

  return (
    <Button
      variant={variant}
      onClick={() =>
        onClickHandler(
          "apply",
          lab,
          "Deployment In Progress",
          "Deployment Failed",
          "Deployment Completed",
          true
        )
      }
      disabled={actionStatus.inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaRocket />
      </span>
      {children}
    </Button>
  );
}
