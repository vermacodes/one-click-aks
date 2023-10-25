import React, { useContext } from "react";
import { FaTrash } from "react-icons/fa";
import { ButtonVariant, DeploymentType, Lab } from "../../../dataStructures";
import { useSetLogs } from "../../../hooks/useLogs";
import { usePreference } from "../../../hooks/usePreference";
import { useDestroy } from "../../../hooks/useTerraform";
import Button from "../../Button";
import {
  useDeleteWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import {
  useDeleteDeployment,
  useGetMyDeployments,
  useUpsertDeployment,
} from "../../../hooks/useDeployments";
import { WebSocketContext } from "../../../WebSocketContext";
import {
  calculateNewEpochTimeForDeployment,
  getSelectedDeployment,
  getSelectedTerraformWorkspace,
} from "../../../utils/helpers";

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
  const { mutate: upsertDeployment } = useUpsertDeployment();
  const { mutateAsync: deleteDeploymentAsync } = useDeleteDeployment();
  const { mutateAsync: deleteWorkspaceAsync } = useDeleteWorkspace();

  function updateDeploymentStatus(
    deployment: DeploymentType | undefined,
    status: DeploymentType["deploymentStatus"]
  ) {
    if (deployment !== undefined) {
      upsertDeployment({
        ...deployment,
        deploymentStatus: status,
        deploymentAutoDeleteUnixTime:
          calculateNewEpochTimeForDeployment(deployment),
      });
    }
  }

  function handleDeleteWorkspace() {
    if (
      deployment === undefined ||
      terraformWorkspaces === undefined ||
      !deleteWorkspace
    ) {
      return;
    }

    // filter workspace from the list of workspaces where deployment matches
    const filteredWorkspace = terraformWorkspaces.filter(
      (workspace) => deployment.deploymentWorkspace === workspace.name
    )[0];

    deleteWorkspaceAsync(filteredWorkspace).then(() => {
      deleteDeploymentAsync([
        deployment.deploymentWorkspace,
        deployment.deploymentSubscriptionId,
      ]);
    });
  }

  function onClickHandler() {
    // if lab is undefined, do nothing
    if (
      lab === undefined ||
      terraformWorkspaces === undefined ||
      deployments === undefined
    ) {
      return;
    }

    // update lab's azure region based on users preference
    if (lab.template !== undefined && preference !== undefined) {
      lab.template.resourceGroup.location = preference.azureRegion;
    }

    // reset logs.
    setLogs({ logs: "" });

    //get the deployment for the selected workspace
    const deployment = getSelectedDeployment(deployments, terraformWorkspaces);
    updateDeploymentStatus(deployment, "Destroying Resources");

    // destroy terraform
    destroyAsync(lab)
      .then(() => {
        updateDeploymentStatus(deployment, "Resources Destroyed");
      })
      .catch(() => {
        updateDeploymentStatus(deployment, "Deployment Failed");
      })
      .finally(() => {
        handleDeleteWorkspace();
      });
  }

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
  );
}
