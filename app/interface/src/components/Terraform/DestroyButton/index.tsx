import React, { useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import {
  ButtonVariant,
  Lab,
  TerraformOperation,
} from "../../../dataStructures";
import {
  useActionStatus,
  useGetTerraformOperation,
} from "../../../hooks/useActionStatus";
import { useEndStream, useSetLogs } from "../../../hooks/useLogs";
import { usePreference } from "../../../hooks/usePreference";
import {
  useDestroy,
  useDestroyAsync,
  useDestroyAsyncExtend,
  useDestroyExtend,
} from "../../../hooks/useTerraform";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  navbarButton?: boolean;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function DestroyButton({
  variant,
  navbarButton,
  children,
  lab,
}: Props) {
  const [terraformOperationState, setTerraformOperationState] =
    React.useState<TerraformOperation>({
      operationId: "",
      operationStatus: "",
      operationType: "",
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

  useEffect(() => {
    console.log(terraformOperationState);
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
      if (
        terraformOperationState.operationStatus === "completed" ||
        terraformOperationState.operationStatus === "failed"
      ) {
        setTerraformOperationState({
          operationId: "",
          operationStatus: "",
          operationType: "",
        });
        endLogStream();
      }
    }
  }, [terraformOperationState]);

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
        disabled={inProgress || lab === undefined}
      >
        {children}
      </button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={onClickHandler}
      disabled={inProgress || lab === undefined}
    >
      <span className="text-base">
        <FaTrash />
      </span>
      {children}
    </Button>
  );
}
