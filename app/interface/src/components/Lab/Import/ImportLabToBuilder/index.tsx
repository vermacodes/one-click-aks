import React, { useContext, useEffect, useRef, useState } from "react";
import { FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import { Lab } from "../../../../dataStructures";
import { useSetLogs } from "../../../../hooks/useLogs";
import { useGlobalStateContext } from "../../../Context/GlobalStateContext";
import { WebSocketContext } from "../../../Context/WebSocketContext";
import Button from "../../../UserInterfaceComponents/Button";

type Props = {};

export default function ImportLabToBuilder({}: Props) {
  const [newLab, setNewLab] = useState<Lab | undefined>();
  const { setLab } = useGlobalStateContext();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutate: setLogs } = useSetLogs();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (newLab != undefined) {
      !actionStatus.inProgress &&
        setLogs({
          logs: JSON.stringify(newLab.template, null, 4),
        });
      setLab(newLab);
    }
  }, [newLab]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file found.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result;
      if (typeof contents === "string") {
        setNewLab(JSON.parse(contents));
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <label htmlFor="file_input">
        <Button variant="secondary-text" onClick={onButtonClick}>
          <span>
            <FaUpload />
          </span>
          Import
        </Button>
      </label>
      <input
        ref={fileInputRef}
        id="file_input"
        className="hidden"
        type="file"
        accept="application/json"
        onChange={handleFileChange}
      />
    </>
  );
}
