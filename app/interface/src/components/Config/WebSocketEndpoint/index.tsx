import { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";
import SettingsItemLayout from "../../../layouts/SettingsItemLayout";

type Props = {};

export default function WebSocketEndpoint({}: Props) {
  const [baseUrl, setBaseUrl] = useState<string>("ws://localhost:8080");
  const [showEditButton, setShowEditButton] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  useEffect(() => {
    const baseUrlFromLocalStorage = localStorage.getItem("webSocketBaseUrl");
    if (
      baseUrlFromLocalStorage != undefined &&
      baseUrlFromLocalStorage !== ""
    ) {
      setBaseUrl(baseUrlFromLocalStorage);
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem("webSocketBaseUrl", baseUrl);
    setEdit(false);
    window.location.reload();
  }

  return (
    <SettingsItemLayout>
      <div className="flex w-full justify-between gap-4 py-2">
        <div className="flex w-full flex-col gap-2">
          <h3 className="text-xl">Web Socket Endpoint</h3>
          <p className="text-xs">
            Web Socket Endpoint. It would be exactly what Web App endpoint is,
            just ws/wss instead of http/https
          </p>
        </div>
        <div
          className={`flex h-10 w-full items-center justify-between rounded border border-slate-500`}
          onMouseEnter={() => setShowEditButton(true)}
          onMouseLeave={() => setShowEditButton(false)}
          onDoubleClick={() => setEdit(true)}
        >
          <p
            className={`${edit && "hidden"} items-center bg-inherit px-1`}
            onClick={() => setEdit(true)}
          >
            {baseUrl}
          </p>
          <form
            className={`${!edit && "hidden"} h-full w-full bg-inherit px-1`}
            onSubmit={(e) => handleSubmit(e)}
          >
            <input
              className={`h-full w-full bg-inherit outline-none`}
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
            />
          </form>
          <button
            className={`${!showEditButton && "hidden"} ${
              edit && "hidden"
            } px-1`}
            onClick={() => setEdit(true)}
          >
            <FaEdit />
          </button>
          <button
            className={`${!edit && "hidden"} px-1 text-green-500`}
            onClick={() => {
              localStorage.setItem("webSocketBaseUrl", baseUrl);
              setEdit(false);
              window.location.reload();
            }}
          >
            <FaCheck />
          </button>
          <button
            className={`${
              !edit && "hidden"
            } px-1 text-slate-900 dark:text-slate-100`}
            onClick={() => {
              setEdit(false);
            }}
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </SettingsItemLayout>
  );
}
