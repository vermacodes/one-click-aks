import React, { useEffect } from "react";
import { FaRocket } from "react-icons/fa";
import {
  ButtonVariant,
  DeploymentType,
  Lab,
  TerraformOperation,
} from "../../../dataStructures";
import {
  useActionStatus,
  useGetTerraformOperation,
} from "../../../hooks/useActionStatus";
import { useOperationRecord } from "../../../hooks/useAuth";
import { useEndStream, useSetLogs } from "../../../hooks/useLogs";
import { usePreference } from "../../../hooks/usePreference";
import {
  useApplyAsync,
  useApplyAsyncExtend,
} from "../../../hooks/useTerraform";
import Button from "../../Button";
import {
  useGetMyDeployments,
  useUpsertDeployment,
} from "../../../hooks/useDeployments";
import {
  useSelectedTerraformWorkspace,
  useTerraformWorkspace,
} from "../../../hooks/useWorkspace";
import {
  calculateNewEpochTimeForDeployment,
  getSelectedDeployment,
} from "../../../utils/helpers";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ApplyButton({ variant, children, lab }: Props) {
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
  const { mutateAsync: applyAsync } = useApplyAsync();
  const { mutateAsync: applyAsyncExtend } = useApplyAsyncExtend();
  const { data: inProgress } = useActionStatus();
  const { data: preference } = usePreference();
  const { data: terraformOperation } = useGetTerraformOperation(
    terraformOperationState.operationId
  );
  const { mutate: operationRecord } = useOperationRecord();
  const { mutate: endLogStream } = useEndStream();
  const { data: deployments } = useGetMyDeployments();
  const { data: terraformWorkspaces } = useTerraformWorkspace();
  const { mutate: upsertDeployment } = useUpsertDeployment();

  useEffect(() => {
    if (terraformWorkspaces === undefined || deployments === undefined) {
      return;
    }

    const deployment = getSelectedDeployment(deployments, terraformWorkspaces);

    if (terraformOperationState.operationType === "apply") {
      if (terraformOperationState.operationStatus === "completed") {
        labState &&
          applyAsyncExtend(labState).then((response) => {
            if (response.status !== undefined) {
              setTerraformOperationState(response.data);
            }
          });
      } else if (terraformOperationState.operationStatus === "failed") {
        setTerraformOperationState({
          operationId: "",
          operationStatus: "",
          operationType: "",
          labId: "",
          labName: "",
          labType: "",
        });

        //update the deployment status
        if (deployment !== undefined) {
          upsertDeployment({
            ...deployment,
            deploymentStatus: "Deployment Failed",
          });
        }

        endLogStream();
      }
    } else if (terraformOperationState.operationType === "extend") {
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

        //update the deployment status
        if (deployment !== undefined) {
          upsertDeployment({
            ...deployment,
            deploymentStatus: "Deployment Completed",
          });
        }

        endLogStream();
      }
    }

    // Logging
    if (terraformOperationState.operationId !== "") {
      operationRecord(terraformOperationState);
    }
  }, [terraformOperationState]);

  function onClickHandler() {
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

    // update lab state
    setLabState(lab);

    // start streaming of logs.
    setLogs({ isStreaming: true, logs: "" });

    // apply terraform
    applyAsync(lab).then((response) => {
      response.status !== undefined &&
        setTerraformOperationState(response.data);

      // update deployment status

      //get the deployment for the selected workspace
      const deployment = getSelectedDeployment(
        deployments,
        terraformWorkspaces
      );

      //update the deployment status
      if (deployment !== undefined) {
        upsertDeployment({
          ...deployment,
          deploymentStatus: "Deployment In Progress",
          deploymentAutoDeleteUnixTime:
            calculateNewEpochTimeForDeployment(deployment),
        });
      }
    });
  }

  if (
    terraformOperation !== undefined &&
    terraformOperation.operationStatus !==
      terraformOperationState.operationStatus
  ) {
    setTerraformOperationState(terraformOperation);
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaRocket />
      </span>
      {children}
    </Button>
  );
}
