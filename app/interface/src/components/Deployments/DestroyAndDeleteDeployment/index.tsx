import {
  ButtonVariant,
  DeploymentType,
  TerraformWorkspace,
} from "../../../dataStructures";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../../hooks/useActionStatus";
import { useDeleteDeployment } from "../../../hooks/useDeployments";
import { useLab } from "../../../hooks/useLab";
import { useEndStream, useSetLogs } from "../../../hooks/useLogs";
import { useDestroy } from "../../../hooks/useTerraform";
import {
  useAddWorkspace,
  useDeleteWorkspace,
  useGetResources,
  useSelectWorkspace,
  useSelectedTerraformWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import Button from "../../Button";

type Props = {
  variant?: ButtonVariant;
  children?: React.ReactNode;
  deleteWorkspace: boolean;
  deployment: DeploymentType;
};

export default function DestroyAndDeleteDeployment(props: Props) {
  const { data: actionStatus } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { data: resources, isFetching: fetchingResources } = useGetResources();
  const { data: lab } = useLab();
  const { mutate: setLogs } = useSetLogs();
  const { mutate: endLogStream } = useEndStream();
  const {
    data: workspaces,
    isFetching: fetchingWorkspaces,
    isLoading: gettingWorkspaces,
  } = useTerraformWorkspace();
  const {
    data: selectedTerraformWorkspace,
    isFetching: fetchingSelectedTerraformWorkspace,
    isLoading: gettingSelectedTerraformWorkspace,
  } = useSelectedTerraformWorkspace();
  const { mutate: deleteWorkspace, isLoading: deletingWorkspace } =
    useDeleteWorkspace();
  const { mutateAsync: selectWorkspaceAsync, isLoading: selectingWorkspace } =
    useSelectWorkspace();
  const { isLoading: addingWorkspace } = useAddWorkspace();
  const { mutate: destroy, mutateAsync: destroyAsync } = useDestroy();
  const { mutateAsync: asyncDeleteDeployment } = useDeleteDeployment();

  async function getSelectedWorkspace(): Promise<TerraformWorkspace> {
    return new Promise((resolve, reject) => {
      if (workspaces === undefined) {
        reject(Error("workspaces are not defined"));
      } else {
        workspaces.map((workspace) => {
          if (workspace.selected === true) {
            resolve(workspace);
          }
        });
      }
    });
  }

  function destroyAndDeleteHandler() {
    // Set logs streaming.
    setLogs({ isStreaming: true, logs: "" });

    // Execute and wait for destroy to complete.
    destroyAsync(props.deployment.deploymentLab).then(() => {
      // Get the current workspace.
      if (props.deleteWorkspace === true) {
        getSelectedWorkspace()
          .then((workspace) => {
            // Change the worksapace to default.
            selectWorkspaceAsync({ name: "default", selected: true }).then(
              () => {
                // Delete deployment.
                asyncDeleteDeployment(
                  props.deployment.deploymentWorkspace
                ).then(() => {
                  deleteWorkspace(workspace);
                });
              }
            );
          })
          .catch(() => {
            console.error("not able to get the selected workspace.");
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
        fetchingResources ||
        gettingWorkspaces ||
        selectingWorkspace ||
        deletingWorkspace ||
        addingWorkspace ||
        fetchingWorkspaces ||
        fetchingSelectedTerraformWorkspace ||
        gettingSelectedTerraformWorkspace ||
        selectedTerraformWorkspace === undefined ||
        props.deployment.deploymentWorkspace !==
          selectedTerraformWorkspace.name ||
        (isDefaultSelected(workspaces) && props.deleteWorkspace === true)
      }
      onClick={() => destroyAndDeleteHandler()}
    >
      {props.children !== undefined ? props.children : "Destroy & Delete"}
    </Button>
  );
}
