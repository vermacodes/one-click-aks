import React, { useEffect } from "react";
import { FaRocket } from "react-icons/fa";
import {
  ButtonVariant,
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

  useEffect(() => {
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
        endLogStream();
      }
    }

    // Logging
    if (terraformOperationState.operationId !== "") {
      operationRecord(terraformOperationState);
    }
  }, [terraformOperationState]);

  function onClickHandler() {
    if (lab === undefined) {
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
    applyAsync(lab).then(
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
