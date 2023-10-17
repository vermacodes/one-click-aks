import {
  ButtonVariant,
  DeploymentType,
  TerraformWorkspace,
} from "../../../dataStructures";
import { useActionStatus } from "../../../hooks/useActionStatus";
import { useDeleteDeployment } from "../../../hooks/useDeployments";
import { useSetLogs } from "../../../hooks/useLogs";
import { useDestroy, useDestroyAsync } from "../../../hooks/useTerraform";
import {
  useAddWorkspace,
  useDeleteWorkspace,
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import { getSelectedTerraformWorkspace } from "../../../utils/helpers";
import Button from "../../Button";

type Props = {
  variant?: ButtonVariant;
  children?: React.ReactNode;
  deleteWorkspace: boolean;
  deployment: DeploymentType;
};

export default function DestroyAndDeleteDeployment(props: Props) {
  const { data: actionStatus } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const {
    data: workspaces,
    isFetching: fetchingWorkspaces,
    isLoading: gettingWorkspaces,
  } = useTerraformWorkspace();
  const { mutate: deleteWorkspace, isLoading: deletingWorkspace } =
    useDeleteWorkspace();
  const { mutateAsync: selectWorkspaceAsync, isLoading: selectingWorkspace } =
    useSelectWorkspace();
  const { isLoading: addingWorkspace } = useAddWorkspace();
  const { mutateAsync: destroyAsync } = useDestroyAsync();
  const { mutateAsync: asyncDeleteDeployment } = useDeleteDeployment();

  function destroyAndDeleteHandler() {
    // Set logs streaming.
    setLogs({ isStreaming: true, logs: "" });

    if (workspaces === undefined) {
      console.error("workspaces are not defined");
      return;
    }

    const selectedTerraformWorkspace =
      getSelectedTerraformWorkspace(workspaces);

    if (selectedTerraformWorkspace === undefined) {
      console.error("workspaces are not defined");
      return;
    }

    // Execute and wait for destroy to complete.
    destroyAsync(props.deployment.deploymentLab).then(() => {
      if (props.deleteWorkspace === true) {
        selectWorkspaceAsync({ name: "default", selected: true }).then(() => {
          // Delete deployment.
          asyncDeleteDeployment(props.deployment.deploymentWorkspace).then(
            () => {
              deleteWorkspace(selectedTerraformWorkspace);
            }
          );
        });
      }
    });
  }

  function isDefaultSelected(
    workspaces: TerraformWorkspace[] | undefined
  ): boolean {
    var returned: boolean = false;

    if (workspaces === undefined) {
      returned = true;
    }
    workspaces?.forEach((workspace) => {
      if (workspace.name === "default" && workspace.selected === true) {
        returned = true;
      }
    });
    return returned;
  }

  return (
    <Button
      variant={props.variant !== undefined ? props.variant : "danger-outline"}
      //disabled
      disabled={
        actionStatus ||
        gettingWorkspaces ||
        selectingWorkspace ||
        deletingWorkspace ||
        addingWorkspace ||
        fetchingWorkspaces ||
        (isDefaultSelected(workspaces) && props.deleteWorkspace === true)
      }
      onClick={() => destroyAndDeleteHandler()}
    >
      {props.children !== undefined ? props.children : "Destroy & Delete"}
    </Button>
  );
}
