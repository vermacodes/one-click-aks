import React, { useEffect } from "react";
import { FaPlane, FaRocket } from "react-icons/fa";
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
  useApply,
  useApplyAsync,
  useApplyAsyncExtend,
  useExtend,
} from "../../../hooks/useTerraform";
import Button from "../../Button";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
  lab: Lab | undefined;
};

export default function ApplyButton({ variant, children, lab }: Props) {
  const [tfOpState, setTfOpState] = React.useState<TerraformOperation>({
    operationId: "",
    operationStatus: "undefined",
    operationType: "",
  });

  const [labState, setLabState] = React.useState<Lab | undefined>(undefined);

  const { mutate: setLogs } = useSetLogs();
  const { mutateAsync: applyAsync } = useApply();
  const { mutateAsync: applyAsync_ } = useApplyAsync();
  const { mutateAsync: applyAsyncExtend } = useApplyAsyncExtend();
  const { mutateAsync: extendAsync } = useExtend();
  const { data: inProgress } = useActionStatus();
  const { data: preference } = usePreference();
  const { data: terraformOperation } = useGetTerraformOperation(
    tfOpState.operationId
  );

  const { mutate: endLogStream } = useEndStream();

  useEffect(() => {
    if (
      tfOpState.operationType === "apply" &&
      labState !== undefined &&
      (tfOpState.operationStatus === "completed" ||
        tfOpState.operationStatus === "failed")
    ) {
      applyAsyncExtend(labState).then((response) => {
        if (response.status !== undefined) {
          setTfOpState(response.data);
          console.log("Status -> ", response.data.operationStatus);
        }
      });
    } else if (tfOpState.operationType === "applyextend") {
      if (
        tfOpState.operationStatus === "completed" ||
        tfOpState.operationStatus === "failed"
      ) {
        setTfOpState({ ...tfOpState, operationStatus: "undefined" });
        endLogStream();
      }
    }
  }, [tfOpState]);

  function onClickHandler() {
    if (lab !== undefined) {
      // update lab's azure region based on users preference
      if (lab.template !== undefined && preference !== undefined) {
        lab.template.resourceGroup.location = preference.azureRegion;
      }

      // update lab state
      setLabState(lab);

      // start streaming of logs.
      setLogs({ isStreaming: true, logs: "" });

      // apply terraform
      applyAsync_(lab).then((response) => {
        if (response.status !== undefined) {
          setTfOpState(response.data);
        }
      });
    }
  }

  if (
    terraformOperation !== undefined &&
    terraformOperation.operationStatus !== tfOpState.operationStatus
  ) {
    setTfOpState(terraformOperation);
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
