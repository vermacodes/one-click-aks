import { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";
import Container from "../../UserInterfaceComponents/Container";

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem("authServiceBaseUrl", baseUrl);
    setEdit(false);
    window.location.reload();
  }

  return (
    <Container title="Auth Service Endpoint" collapsible={true}>
      <div className="flex w-full flex-col gap-4 py-2">
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
        <div className="flex w-full flex-col gap-2">
          <p className="text-xs">
            Auth Service Endpoint. You probably don't want to edit this unless
            you know what you are doing. But, if you know, you know. Go ahead.
          </p>
        </div>
      </div>
    </Container>
  );
}
