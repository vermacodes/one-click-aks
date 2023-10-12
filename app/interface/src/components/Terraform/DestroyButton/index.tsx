import React, { useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import {
  ButtonVariant,
  DeploymentType,
  Lab,
  TerraformOperation,
  TerraformWorkspace,
} from "../../../dataStructures";
import {
  useActionStatus,
  useGetTerraformOperation,
} from "../../../hooks/useActionStatus";
import { useOperationRecord } from "../../../hooks/useAuth";
import { useEndStream, useSetLogs } from "../../../hooks/useLogs";
import { usePreference } from "../../../hooks/usePreference";
import {
  useDestroy,
  useDestroyAsync,
  useDestroyAsyncExtend,
  useDestroyExtend,
} from "../../../hooks/useTerraform";
import Button from "../../Button";
import {
  useDeleteWorkspace,
  useSelectWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import { useDeleteDeployment } from "../../../hooks/useDeployments";

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
  const [terraformOperationState, setTerraformOperationState] =
    React.useState<TerraformOperation>({
      operationId: "",
      operationStatus: "",
      operationType: "",
      labId: "",
      labName: "",
      labType: "",
    });

  const [labState, setLabState] = React.useState<Lab | undefined>(undefined);

  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: destroyAsync } = useDestroyAsync();
  const { mutateAsync: destroyAsyncExtend } = useDestroyAsyncExtend();
  const { data: inProgress } = useActionStatus();
  const { data: preference } = usePreference();
  const { mutate: endLogStream } = useEndStream();
  const { data: terraformOperation } = useGetTerraformOperation(
    terraformOperationState.operationId
  );
  const { mutate: operationRecord } = useOperationRecord();
  const {
    data: workspaces,
    isFetching: fetchingWorkspaces,
    isLoading: gettingWorkspaces,
  } = useTerraformWorkspace();
  const { mutateAsync: selectWorkspaceAsync, isLoading: selectingWorkspace } =
    useSelectWorkspace();
  const { mutateAsync: asyncDeleteDeployment } = useDeleteDeployment();
  const {
    mutateAsync: asyncDeleteWorkspaceFunc,
    isLoading: deletingWorkspace,
  } = useDeleteWorkspace();

  useEffect(() => {
    if (terraformOperationState.operationType === "extend") {
      if (terraformOperationState.operationStatus === "completed") {
        labState &&
          destroyAsync(labState).then((response) => {
            if (response.status !== undefined) {
              setTerraformOperationState(response.data);
            }
          });
      } else if (terraformOperationState.operationStatus === "failed") {
        endLogStream();
      }
    } else if (terraformOperationState.operationType === "destroy") {
      // hanlde deleting workspace if needed.
      if (
        deleteWorkspace === true &&
        deployment !== undefined &&
        terraformOperationState.operationStatus === "completed"
      ) {
        getSelectedWorkspace()
          .then((workspace) => {
            // Change the worksapace to default.
            selectWorkspaceAsync({ name: "default", selected: true }).then(
              () => {
                // Delete deployment.
                asyncDeleteWorkspaceFunc(workspace).then(() => {
                  asyncDeleteDeployment(deployment.deploymentWorkspace);
                });
              }
            );
          })
          .catch(() => {
            console.error("not able to get the selected workspace.");
          });
      }

      if (
        terraformOperationState.operationStatus === "completed" ||
        terraformOperationState.operationStatus === "failed"
      ) {
        setTerraformOperationState({
          operationId: "",
          operationStatus: "",
          operationType: "",
          labId: "",
          labName: "",
          labType: "",
        });
        endLogStream();
      }
    }

    // Logging
    if (terraformOperationState.operationId !== "") {
      operationRecord(terraformOperationState);
    }
  }, [terraformOperationState]);

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

  function onClickHandler() {
    // if lab is undefined, do nothing
    if (lab === undefined) {
      return;
    }

    // update lab's azure region based on users preference
    if (lab.template !== undefined && preference !== undefined) {
      lab.template.resourceGroup.location = preference.azureRegion;
    }

    // set the state of the lab
    setLabState(lab);

    setLogs({ isStreaming: true, logs: "" });

    destroyAsyncExtend(lab).then(
      (response) =>
        response.status !== undefined &&
        setTerraformOperationState(response.data)
    );
  }

  if (
    terraformOperation !== undefined &&
    terraformOperation.operationStatus !==
      terraformOperationState.operationStatus
  ) {
    setTerraformOperationState(terraformOperation);
  }

  // This is used by Navbar
  if (navbarButton) {
    return (
      <button
        className="flex h-full w-full items-center justify-start gap-2 rounded py-3 px-4 text-left text-base disabled:cursor-not-allowed disabled:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
        onClick={onClickHandler}
        disabled={inProgress || lab === undefined || disabled}
      >
        {children}
      </button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={inProgress || lab === undefined || disabled}
    >
      <span className="text-base">
        <FaTrash />
      </span>
      {children}
    </Button>
  );
}
