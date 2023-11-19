import { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";
import SettingsItemLayout from "../../../layouts/SettingsItemLayout";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import { useQueryClient } from "react-query";
import { useResetServerCache } from "../../../hooks/useServerCache";
import Button from "../../UserInterfaceComponents/Button";
import { useAuth } from "../../Context/AuthContext";

type Props = {};

export default function ServerEndpoint({}: Props) {
  const [baseUrl, setBaseUrl] = useState<string>("http://localhost:8880/");
  const [showEditButton, setShowEditButton] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { mutateAsync: resetServerCache } = useResetServerCache();
  const { graphResponse } = useAuth();

  useEffect(() => {
    const baseUrlFromLocalStorage = localStorage.getItem("baseUrl");
    if (
      baseUrlFromLocalStorage != undefined &&
      baseUrlFromLocalStorage !== ""
    ) {
      setBaseUrl(baseUrlFromLocalStorage);
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEdit(false);
    handleSwitch(baseUrl);
  }

  function handleSwitch(baseUrl: string) {
    localStorage.setItem("baseUrl", baseUrl);
    setBaseUrl(baseUrl);
    window.location.reload();
    resetServerCache().finally(() => {
      const queryClient = useQueryClient();
      queryClient.invalidateQueries();
    });
  }

  return (
    <SettingsItemLayout>
      <div className="flex w-full justify-between gap-4 py-2">
        <div className="flex w-full flex-col gap-2">
          <h3 className="text-xl">Server Endpoint</h3>
          <p className="text-xs">
            Server Endpoint. You probably don't want to edit this unless you
            know what you are doing. But, if you know, you know. Go ahead.
          </p>
          <p className="w-fit rounded border border-yellow-600 bg-yellow-600 bg-opacity-10 py-1 px-3 text-xs">
            Note: ARO labs only work with the Docker option.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          {graphResponse ? (
            <div className="flex items-center justify-end gap-2">
              <Checkbox
                id="custom"
                checked={
                  baseUrl !== "http://localhost:8880/" &&
                  baseUrl !==
                    "https://" +
                      graphResponse.userPrincipalName.split("@")[0] +
                      "-webapp-actlabs.azurewebsites.net/"
                }
                disabled={true}
                handleOnChange={() => {}}
                label={"Custom"}
                key={"key"}
              />
              <Checkbox
                id="docker"
                checked={baseUrl === "http://localhost:8880/"}
                disabled={false}
                handleOnChange={() => {
                  handleSwitch("http://localhost:8880/");
                }}
                label={"Docker"}
                key={"key"}
              />
              <Checkbox
                id="webapp"
                checked={
                  baseUrl ===
                  "https://" +
                    graphResponse.userPrincipalName.split("@")[0] +
                    "-webapp-actlabs.azurewebsites.net/"
                }
                disabled={!graphResponse}
                handleOnChange={() => {
                  handleSwitch(
                    "https://" +
                      graphResponse.userPrincipalName.split("@")[0] +
                      "-webapp-actlabs.azurewebsites.net/"
                  );
                }}
                label={"WebApp"}
                key={"key"}
              />
              <Checkbox
                id="webapp-nprd"
                checked={
                  baseUrl ===
                  "https://" +
                    graphResponse.userPrincipalName.split("@")[0] +
                    "-webapp-actlabs-fdpo.azurewebsites.net/"
                }
                disabled={!graphResponse}
                handleOnChange={() => {
                  handleSwitch(
                    "https://" +
                      graphResponse.userPrincipalName.split("@")[0] +
                      "-webapp-actlabs-fdpo.azurewebsites.net/"
                  );
                }}
                label={"WebApp (NonProd)"}
                key={"key"}
              />
            </div>
          ) : (
            // Dummy placeholders
            <div className="flex items-center justify-end gap-2">
              <Checkbox
                id="custom"
                checked={false}
                disabled={true}
                handleOnChange={() => {}}
                label={"Custom"}
                key={"key"}
              />
              <Checkbox
                id="docker"
                checked={false}
                disabled={true}
                handleOnChange={() => {}}
                label={"Docker"}
                key={"key"}
              />
              <Checkbox
                id="webapp"
                checked={false}
                disabled={true}
                handleOnChange={() => {}}
                label={"WebApp"}
                key={"key"}
              />
              <Checkbox
                id="webapp"
                checked={false}
                disabled={true}
                handleOnChange={() => {}}
                label={"WebApp (NonProd)"}
                key={"key"}
              />
            </div>
          )}
          <div
            className={`flex h-fit w-full items-center justify-between rounded border border-slate-500 py-1 px-2`}
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
            {!edit && showEditButton && (
              <div className="flex space-x-1 py-1 px-2">
                <Button variant="primary-icon" onClick={() => setEdit(true)}>
                  <FaEdit />
                </Button>
              </div>
            )}
            {edit && (
              <div className="flex space-x-1 py-1 px-2">
                <Button
                  variant="primary-icon"
                  onClick={() => {
                    localStorage.setItem("baseUrl", baseUrl);
                    setEdit(false);
                    window.location.reload();
                  }}
                >
                  <FaCheck />
                </Button>
                <Button
                  variant="secondary-icon"
                  onClick={() => {
                    setEdit(false);
                  }}
                >
                  <FaTimes />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SettingsItemLayout>
  );
}
