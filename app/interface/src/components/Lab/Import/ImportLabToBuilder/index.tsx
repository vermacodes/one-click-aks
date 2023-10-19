import React, { useContext, useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";
import { Lab } from "../../../../dataStructures";
import { useActionStatus } from "../../../../hooks/useActionStatus";
import { useSetLab } from "../../../../hooks/useLab";
import { useSetLogs } from "../../../../hooks/useLogs";
import Button from "../../../Button";
import { WebSocketContext } from "../../../../WebSocketContext";

type Props = {};

export default function ImportLabToBuilder({}: Props) {
  const [lab, _setLab] = useState<Lab | undefined>();
  const { mutate: setLab } = useSetLab();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();

  useEffect(() => {
    if (lab != undefined) {
      !actionStatus.inProgress &&
        setLogs({
          isStreaming: false,
          logs: JSON.stringify(lab.template, null, 4),
        });
      setLab(lab);
    }
  }, [lab]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result;
      if (typeof contents === "string") {
        _setLab(JSON.parse(contents));
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <label htmlFor="file_input">
        <Button variant="secondary-text">
          <span>
            <FaUpload />
          </span>
          Import
        </Button>
      </label>
      <input
        id="file_input"
        className="hidden"
        type="file"
        accept="application/json"
        onChange={handleFileChange}
      />
    </>
  );
}
