import { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";

type Props = {};

export default function AuthServiceEndpoint({}: Props) {
  const [baseUrl, setBaseUrl] = useState<string>(
    "https://actlabs-auth.azurewebsites.net"
  );
  const [showEditButton, setShowEditButton] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  useEffect(() => {
    const baseUrlFromLocalStorage = localStorage.getItem("authServiceBaseUrl");
    if (
      baseUrlFromLocalStorage != undefined &&
      baseUrlFromLocalStorage !== ""
    ) {
      setBaseUrl(baseUrlFromLocalStorage);
    }
  }, []);

  return (
    <div className="flex w-60 flex-col gap-2 p-2">
      <div
        className={`${
          showEditButton ? "bg-rose-500 text-slate-100" : ""
        } flex h-8 items-center justify-between rounded border-2 border-rose-500 text-rose-500`}
        onMouseEnter={() => setShowEditButton(true)}
        onMouseLeave={() => setShowEditButton(false)}
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
            localStorage.setItem("authServiceBaseUrl", baseUrl);
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
      <p className="text-xs">
        Auth Service Endpoint. You probably dont want to edit this unless you
        know what you are doing. But, if you know, you know. Go ahead.
      </p>
    </div>
  );
}
