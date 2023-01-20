import { useEffect, useState } from "react";
import { FaCheck, FaEdit } from "react-icons/fa";

type Props = {};

export default function ServerEndpoint({}: Props) {
  const [baseUrl, setBaseUrl] = useState<string>("http://localhost:8080/");
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
    <div className="flex w-60 flex-col gap-2 p-2">
      <div
        className="flex h-8 items-center justify-between rounded border border-slate-500"
        onMouseEnter={() => setShowEditButton(true)}
        onMouseLeave={() => setShowEditButton(false)}
      >
        <p className={`${edit && "hidden"} items-center bg-inherit px-1`}>
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
          className={`${!showEditButton && "hidden"} ${edit && "hidden"} px-1`}
          onClick={() => setEdit(true)}
        >
          <FaEdit />
        </button>
        <button
          className={`${!edit && "hidden"} px-1`}
          onClick={() => {
            localStorage.setItem("baseUrl", baseUrl);
            setEdit(false);
            window.location.reload();
          }}
        >
          <FaCheck />
        </button>
      </div>
    </div>
  );
}
