import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { FaSignInAlt, FaUserNinja } from "react-icons/fa";
import { loginRequest } from "../../../authConfig";
import { GraphData } from "../../../dataStructures";

type Props = {};

export default function LoginButton({}: Props) {
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
    if (tokenAcquired) {
      getGraphData();
      getProfilePhoto();
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
          console.log("Graph Data -> ", data);
        });
      } else {
        console.log(response);
      }
    });
  }

  async function getProfilePhoto() {
    fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((response) => {
      if (response.ok) {
        response.blob().then((data) => {
          setProfilePhotoUrl(URL.createObjectURL(data));
        });
      } else {
        console.log(response);
      }
    });
  }

  function RequestAccessToken() {
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
        instance.acquireTokenRedirect(request).then(() => {
          instance.acquireTokenSilent(request).then((response) => {
            setAccessToken(response.accessToken);
            setTokenAcquired(true);
          });
        });
      });
  }

  return (
    <div>
      {graphResponse ? (
        <a className="justify-star flex h-full w-full items-center gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800">
          <span>
            {profilePhotoUrl === "" ? (
              <FaUserNinja />
            ) : (
              <img
                className="h-8 w-8 rounded-full"
                src={profilePhotoUrl}
                alt="Profile Picture"
              />
            )}
          </span>
          <span>{graphResponse.displayName}</span>
        </a>
      ) : (
        <button
          className="justify-star flex h-full w-full items-center gap-2 rounded py-3 px-4 text-left text-base hover:bg-slate-200 dark:hover:bg-slate-800"
          onClick={() => RequestAccessToken()}
        >
          <span>
            <FaSignInAlt />
          </span>
          <span>Login</span>
        </button>
      )}
    </div>
  );
}
