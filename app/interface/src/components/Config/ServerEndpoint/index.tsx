import { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";

type Props = {};

export default function ServerEndpoint({}: Props) {
  const [baseUrl, setBaseUrl] = useState<string>("http://localhost:8880/");
  const [showEditButton, setShowEditButton] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  useEffect(() => {
    const baseUrlFromLocalStorage = localStorage.getItem("baseUrl");
    if (
      baseUrlFromLocalStorage != undefined &&
      baseUrlFromLocalStorage !== ""
    ) {
      setBaseUrl(baseUrlFromLocalStorage);
    }
  }, []);

  return (
    <div className="flex w-full justify-between gap-4 py-2">
      <div className="flex w-full flex-col gap-2">
        <h3 className="text-xl">Server Endpoint</h3>
        <p className="text-xs">
          Server Endpoint. You probably dont want to edit this unless you know
          what you are doing. But, if you know, you know. Go ahead.
        </p>
      </div>
      <div
        className={`${
          showEditButton ? " text-slate-100" : ""
        } flex h-8 w-full items-center justify-between rounded border border-slate-500`}
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
        <input
          className={`${
            !edit && "hidden"
          } h-full w-full bg-inherit px-1 outline-none`}
          value={baseUrl}
          onChange={(event) => setBaseUrl(event.target.value)}
        />
        <button
          className={`${!showEditButton && "hidden"} ${
            edit && "hidden"
          } px-1 text-slate-100`}
          onClick={() => setEdit(true)}
        >
          <FaEdit />
        </button>
        <button
          className={`${!edit && "hidden"} px-1 text-green-500`}
          onClick={() => {
            localStorage.setItem("baseUrl", baseUrl);
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
  );
}
