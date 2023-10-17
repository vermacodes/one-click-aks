import { useMsal } from "@azure/msal-react";
import { Switch } from "@headlessui/react";
import { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";
import { loginRequest } from "../../../authConfig";
import { GraphData } from "../../../dataStructures";
import SettingsItemLayout from "../../../layouts/SettingsItemLayout";
import Checkbox from "../../Checkbox";

type Props = {};

export default function ServerEndpoint({}: Props) {
  const [baseUrl, setBaseUrl] = useState<string>("http://localhost:8880/");
  const [showEditButton, setShowEditButton] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const { instance, accounts, inProgress } = useMsal();
  const [graphResponse, setGraphResponse] = useState<GraphData | undefined>();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [tokenAcquired, setTokenAcquired] = useState<boolean>(false);

  // call RequestAccessToken after the component has mounted
  useEffect(() => {
    RequestAccessToken();
  }, []);

  useEffect(() => {
    if (tokenAcquired || accessToken !== "") {
      getGraphData();
    }
  }, [tokenAcquired, accessToken]);

  async function getGraphData() {
    fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          setGraphResponse(data);
        });
      }
    });
  }

  async function RequestAccessToken() {
    const request = {
      ...loginRequest,
      account: accounts[0],
    };

    // Silently acquires an access token which is then attached to a request for Microsoft Graph data
    instance
      .acquireTokenSilent(request)
      .then((response) => {
        setAccessToken(response.accessToken);
        setTokenAcquired(true);
      })
      .catch((e) => {
        instance.acquireTokenRedirect(request);
      });
  }

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
    localStorage.setItem("baseUrl", baseUrl);
    setEdit(false);
    window.location.reload();
  }

  function handleSwitch(baseUrl: string) {
    localStorage.setItem("baseUrl", baseUrl);
    window.location.reload();
  }

  return (
    <SettingsItemLayout>
      <div className="flex w-full justify-between gap-4 py-2">
        <div className="flex w-full flex-col gap-2">
          <h3 className="text-xl">Server Endpoint</h3>
          <p className="text-xs">
            Server Endpoint. You probably dont want to edit this unless you know
            what you are doing. But, if you know, you know. Go ahead.
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
      </div>
    </SettingsItemLayout>
  );
}
