import React, { useContext } from "react";
import { FaFile } from "react-icons/fa";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import { useSetLogs } from "../../../../hooks/useLogs";
import { usePreference } from "../../../../hooks/usePreference";
import { usePlan } from "../../../../hooks/useTerraform";
import Button from "../../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../../../WebSocketContext";
import {
  useGetMyDeployments,
  usePatchDeployment,
} from "../../../../hooks/useDeployments";
import { useTerraformWorkspace } from "../../../../hooks/useWorkspace";
import { useTerraformOperation } from "../../../../hooks/useTerraformOperation";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function PlanButton({ variant, children, lab }: Props) {
  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: planAsync } = usePlan();
  const { actionStatus, setActionStatus } = useContext(WebSocketContext);
  const { data: preference } = usePreference();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { mutate: patchDeployment } = usePatchDeployment();

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

  //     if (terraformOp.status === "Plan Completed") {
  //       toast.success("Plan Completed"),
  //         {
  //           autoClose: 5000,
  //         };
  //       updateDeploymentStatus(deployment, "Plan Completed");
  //     } else if (terraformOp.status === "Plan Failed") {
  //       toast.error("Plan Failed"),
  //         {
  //           autoCLose: 10000,
  //         };
  //       updateDeploymentStatus(deployment, "Plan Failed");
  //     }
  //     clearInterval(intervalId);
  //   }, 10000);
  // }

  // function onClickHandler() {
  //   // Apply Preference
  //   if (
  //     lab === undefined ||
  //     lab.template === undefined ||
  //     deployments === undefined ||
  //     terraformWorkspaces === undefined
  //   ) {
  //     toast.error(
  //       "Something isn't right. Try 'Reset Server Cache' from settings."
  //     );
  //     return;
  //   }

  //   // Set the location to the preference
  //   if (preference !== undefined) {
  //     lab.template.resourceGroup.location = preference.azureRegion;
  //   }

  //   // reset logs
  //   setLogs({ logs: "" });

  //   const deployment = getSelectedDeployment(deployments, terraformWorkspaces);
  //   if (deployment === undefined) {
  //     toast.error(
  //       "No deployment selected. Try 'Reset Server Cache' from settings."
  //     );
  //     return;
  //   }

  //   updateDeploymentStatus(deployment, "Plan In Progress");

  //   // submit plan operation
  //   const response = toast.promise(planAsync(lab), {
  //     pending: "Starting plan...",
  //     success: {
  //       render(data: any) {
  //         return `Plan started.`;
  //       },
  //       autoClose: 5000,
  //     },
  //     error: {
  //       render(data: any) {
  //         return `Plan failed: ${data.data.data}`;
  //       },
  //       autoClose: 10000,
  //     },
  //   });

  //   response
  //     .then((data) => {
  //       checkDeploymentStatus(data.data, deployment);
  //     })
  //     .catch(() => {
  //       updateDeploymentStatus(deployment, "Plan Failed");
  //     });
  // }

  const { onClickHandler } = useTerraformOperation();

  return (
    <Button
      variant={variant}
      onClick={() =>
        onClickHandler({
          operationType: "plan",
          lab: lab,
          inProgressStatus: "Plan In Progress",
          failedStatus: "Plan Failed",
          completedStatus: "Plan Completed",
          extendLifespan: false,
          deleteWorkspace: false,
        })
      }
      tooltipMessage="Preview the changes before deploy."
      tooltipDelay={1000}
      disabled={actionStatus.inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaFile />
      </span>
      {children}
    </Button>
  );
}
